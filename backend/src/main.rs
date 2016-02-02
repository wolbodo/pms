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

use persistent::Read;
use iron::status;
use hyper::header::Authorization;

use iron::prelude::*;
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

    //let mut userContext = BTreeMap::new();
    //userContext
    let token: String = rows.get(0).get(0);
    Ok(Response::with((status::Ok, token)))
}

fn handle_people(req: &mut Request) -> IronResult<Response> {
    // Returns a list of people, might be using filters. 

    let db = req.db_conn();

    let token = match req.headers.get::<Authorization<String>>() {
        Some(&Authorization(ref token)) => token.clone().to_string(),
        None => "".to_string()
    };

    println!("Authorization token: {}", token);

    let stmt = db.prepare("SELECT getpeople(token := $1);").unwrap();
    let rows = stmt.query(&[&token]).unwrap();

    let mut people: Vec<Value> = Vec::new();

    for row in rows.iter() {
        println!("{:?}", row);
        
        let data: Value = row.get("getpeople");
        println!("{:?}", data);

        people.push(data);
    }

    Ok(Response::with((status::Ok, serde_json::to_string(&people).unwrap())))
    // // Err(Response::with((status::Ok)));
}

fn handle_edit(_: &mut Request) -> IronResult<Response> {
    // Update an existing person.

    Ok(Response::with((status::Ok)))
}

fn handle_create(_: &mut Request) -> IronResult<Response> {
    // Create a new person. 

    Ok(Response::with((status::Ok)))
}

fn handle_fields(_: &mut Request) -> IronResult<Response> {
    // Return fields. 

    Ok(Response::with((status::Ok)))
}

fn handle_fields_edit(_: &mut Request) -> IronResult<Response> {
    // Update fields, admin only. 

    Ok(Response::with((status::Ok)))
}

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {

    let router = router!(
        post "/login" => handle_login,
        get "/people" => handle_people,
        put "/person/:id" => handle_edit,
        get "/fields" => handle_fields,
        put "/fields" => handle_fields_edit,
        post "/person/new" => handle_create
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
    Iron::new(chain).http("0.0.0.0:4242").unwrap();
}
