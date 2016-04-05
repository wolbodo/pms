#![feature(custom_derive, plugin)]
#![plugin(postgres_macros, serde_macros)]
extern crate iron;
extern crate bodyparser;
extern crate persistent;
extern crate serde;
extern crate serde_json;
extern crate hyper;
#[macro_use(router)]
extern crate router;
extern crate postgres;
extern crate iron_postgres_middleware as pg_middleware;

use std::collections::BTreeMap;

use persistent::Read;
use iron::status;
use iron::{AfterMiddleware};
use iron::prelude::*;
use iron::modifiers::Header;

use hyper::header::{Authorization, ContentType};
use hyper::mime::{Mime, TopLevel, SubLevel};

use router::Router;

use serde_json::*;
use pg_middleware::{PostgresMiddleware, PostgresReqExt};
use postgres::error::Error as PgError;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Login {
   user: String,
   password: String,
}

const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;

#[derive(Serialize, Deserialize, Debug)]
struct SimpleError {
    error: String
}

//General notes:

//For status codes, please consult http://racksburg.com/choosing-an-http-status-code/

//Propper use of Authorization header: http://hdknr.bitbucket.org/accounts/bearer.html examples:
//Client sends: Authorization: Bearer {{JWT}}
//Server sends: HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Bearer realm="example", error="invalid_token", error_description="The access token expired"

macro_rules! badrequest {
    ($msg:expr) => (return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

macro_rules! internalerror {
    ($msg:expr) => (return Ok(Response::with((status::InternalServerError, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

macro_rules! notfound {
    ($msg:expr) => (return Ok(Response::with((status::NotFound, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

fn handle_login(req: &mut Request) -> IronResult<Response> {
    //TODO: correct header (json), fix OK path to json.

    let db = req.db_conn();
    let login = match req.get::<bodyparser::Struct<Login>>() {
        Ok(Some(body)) => body,
        Ok(None) => badrequest!("Please send some body!".to_string()),
        Err(bodyparser::BodyError { cause: bodyparser::BodyErrorCause::JsonError(err), ..}) => badrequest!(err.to_string()),
        Err(err) => badrequest!(err.to_string())
    };
    let stmt = db.prepare(sql!("SELECT login(emailaddress := $1, password := $2);")).unwrap();

    let rows = match stmt.query(&[&login.user, &login.password]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => badrequest!(err.message),
        Err(err) => badrequest!(err.to_string()),
    };

    let mut resp = BTreeMap::new();

    let token: String = rows.get(0).get(0);
    resp.insert("token", token);

    //let mut userContext = BTreeMap::new();
    //userContext
    Ok(Response::with((status::Ok, serde_json::to_string(&resp).unwrap())))
}

fn handle_people_get(req: &mut Request) -> IronResult<Response> {
    // Returns a list of people, might be using filters. 

    let ref people_id_arg = req.extensions.get::<Router>().unwrap().find("id").unwrap_or("-1");
    let people_id = match people_id_arg.parse::<i32>() {
        Ok(value) => value,
        Err(err) => badrequest!(err.to_string())
    };

    let db = req.db_conn();

    let token = match req.headers.get::<Authorization<String>>() {
        Some(&Authorization(ref token)) => token.clone().to_string(),
        None => "".to_string()
    };

    println!("Authorization token: {}", token);

    let stmt = db.prepare(sql!("SELECT people_get(token := $1, people_id := $2);")).unwrap();

    let rows = match stmt.query(&[&token, &people_id]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => badrequest!(err.message),
        Err(err) => badrequest!(err.to_string()),
    };

    let people: Value = match rows.get(0).get(0) {
        Some(value) => value,
        None => notfound!("Id not found (or no read access)".to_string())
    };

    Ok(Response::with((status::Ok, serde_json::to_string(&people).unwrap())))
    // // Err(Response::with((status::Ok)));
}



fn handle_people_set(req: &mut Request) -> IronResult<Response> {
    // Update an existing person.

    let people_id;
    {
        let router = req.extensions.get::<Router>().unwrap();
        let ref people_id_arg = router.find("id").unwrap();
        people_id = match people_id_arg.parse::<i32>() {
            Ok(value) => value,
            Err(err) => badrequest!(err.to_string())
        };
    }

    let db = req.db_conn();

    let token = match req.headers.get::<Authorization<String>>() {
        Some(&Authorization(ref token)) => token.clone().to_string(),
        None => "".to_string() 
    };

    let data = match req.get::<bodyparser::Struct<Value>>() {
        Ok(Some(body)) => body,
        Ok(None) => badrequest!("Please send some body!".to_string()),
        Err(bodyparser::BodyError { cause: bodyparser::BodyErrorCause::JsonError(err), ..}) => badrequest!(err.to_string()),
        Err(err) => badrequest!(err.to_string())
    };

    let stmt = db.prepare(sql!("SELECT people_set(token := $1, people_id := $2, data := $3);")).unwrap();

    let rows = match stmt.query(&[&token, &people_id, &data]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => badrequest!(err.message),
        Err(err) => badrequest!(err.to_string()),
    };

    let people = match rows.get(0).get(0) {
        value@ Value::Array(_) => value,
        value@Value::Object(_) => value,
        Value::Null | _ => internalerror!("unexpected response from database".to_string())
    };

    Ok(Response::with((status::Ok, serde_json::to_string(&people).unwrap())))
    // // Err(Response::with((status::Ok)));

}

fn handle_people_add(req: &mut Request) -> IronResult<Response> {
    // Create a new person. 

    let db = req.db_conn();

    let token = match req.headers.get::<Authorization<String>>() {
        Some(&Authorization(ref token)) => token.clone().to_string(),
        None => "".to_string() 
    };

    let data = match req.get::<bodyparser::Struct<Value>>() {
        Ok(Some(body)) => body,
        Ok(None) => badrequest!("Please send some body!".to_string()),
        Err(bodyparser::BodyError { cause: bodyparser::BodyErrorCause::JsonError(err), ..}) => badrequest!(err.to_string()),
        Err(err) => badrequest!(err.to_string())
    };

    let stmt = db.prepare(sql!("SELECT people_add(token := $1, data := $2);")).unwrap();

    let rows = match stmt.query(&[&token, &data]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => badrequest!(err.message),
        Err(err) => badrequest!(err.to_string()),
    };

    let people = match rows.get(0).get(0) {
        value@ Value::Array(_) => value,
        value@Value::Object(_) => value,
        Value::Null | _ => internalerror!("unexpected response from database".to_string())
    };

    Ok(Response::with((status::Ok, serde_json::to_string(&people).unwrap())))
}

fn handle_fields(_: &mut Request) -> IronResult<Response> {
    // Return fields. 

    Ok(Response::with((status::Ok)))
}

fn handle_fields_edit(_: &mut Request) -> IronResult<Response> {
    // Update fields, admin only. 

    Ok(Response::with((status::Ok)))
}

struct JsonResponse;

impl AfterMiddleware for JsonResponse {
    fn after(&self, _: &mut Request, res: Response) -> IronResult<Response> {
        Ok(res.set(Header(ContentType(Mime(TopLevel::Application, SubLevel::Json, vec![])))))
    }
}

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {

    let router = router!(
        post "/login"      => handle_login,

        post "/people"     => handle_people_add,
        get  "/people"     => handle_people_get,
        get  "/people/:id" => handle_people_get,
        put  "/people/:id" => handle_people_set,

        // post "/groups"     => handle_groups_add,
        // get  "/groups"     => handle_groups_get,
        // get  "/groups/:id" => handle_groups_get,
        // put  "/groups/:id" => handle_groups_set,

        // post "/permissions"     => handle_permissions_add,
        // get  "/permissions"     => handle_permissions_get,
        // get  "/permissions/:id" => handle_permissions_get,
        // put  "/permissions/:id" => handle_permissions_set,

        // post "/link"     => handle_link_add,
        // get  "/link"     => handle_link_get,
        // get  "/link/:id" => handle_link_get,
        // put  "/link/:id" => handle_link_set,

        get  "/fields"     => handle_fields,
        put  "/fields"     => handle_fields_edit
    );

    let mut chain = Chain::new(router);

    // for unix domain sockets use: 
    match PostgresMiddleware::new("postgres://pms@%2Frun%2Fpostgresql") {
        Ok(pg_middleware) => {
            chain.link_before(pg_middleware);
            println!("Connected to database.");
        },
        Err(err) => {
            panic!("Database connection error: {}", err);
        }
    }

    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    chain.link_after(JsonResponse);

    Iron::new(chain).http("0.0.0.0:4242").unwrap();
}
