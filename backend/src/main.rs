#![feature(custom_derive, plugin)]
#![plugin(postgres_macros, serde_macros)]
extern crate bodyparser;
extern crate crypto;
extern crate iron;
extern crate iron_postgres_middleware as pg_middleware;
extern crate persistent;
extern crate postgres;
#[macro_use(router)]
extern crate router;
extern crate rustc_serialize as serialize;
extern crate serde;
extern crate serde_json;

use crypto::digest::Digest;
use crypto::sha2::Sha256;

use iron::AfterMiddleware;
use iron::headers::{Authorization, ContentType, ETag, EntityTag, IfNoneMatch};
use iron::method::Method;
use iron::mime::{Mime, TopLevel, SubLevel};
use iron::modifiers::Header;
use iron::prelude::*;
use iron::status;

use persistent::Read;

use pg_middleware::{PostgresMiddleware, PostgresReqExt};
use postgres::error::Error as PgError;

use router::Router;

use serde_json::*;
use serialize::base64::{self, ToBase64};

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

macro_rules! ok_json {
    ($msg:expr) => (Ok(Response::with((status::Ok, serde_json::to_string($msg).unwrap()))));
}

macro_rules! badrequest {
    ($msg:expr) => (return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

macro_rules! internalerror {
    ($msg:expr) => (return Ok(Response::with((status::InternalServerError, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

macro_rules! notfound {
    ($msg:expr) => (return Ok(Response::with((status::NotFound, serde_json::to_string(&SimpleError{error: $msg}).unwrap()))));
}

macro_rules! get_param {
    ($req:expr, $name:expr, $res_type:ty) => (
        match $req.extensions.get::<Router>().unwrap().find($name).unwrap_or("-1").parse::<$res_type>() {
            Ok(value) => value,
            Err(err) => badrequest!(err.to_string())
        }
    );
}

macro_rules! get_token {
    ($req:expr) => (
        match $req.headers.get::<Authorization<String>>() {
            Some(&Authorization(ref token)) => token.clone().to_string(),
            None => badrequest!("No Authorization header found".to_string())
        }
    );
}

macro_rules! expand_sql_arguments {
    // Start
    ( $name1:ident ) => ( concat!(
        stringify!($name1), " := $1"
    ));
    ( $name1:ident, $name2:ident ) => ( concat!(
        stringify!($name1), " := $1,",
        stringify!($name2), " := $2"
    ));
    ( $name1:ident, $name2:ident, $name3:ident ) => ( concat!(
        stringify!($name1), " := $1,",
        stringify!($name2), " := $2,",
        stringify!($name3), " := $3"
    ));
    ( $name1:ident, $name2:ident, $name3:ident, $name4:ident ) => ( concat!(
        stringify!($name1), " := $1,",
        stringify!($name2), " := $2,",
        stringify!($name3), " := $3,",
        stringify!($name4), " := $4"
    ));
}

macro_rules! print_values {
    ($($value:expr),*) => ({
        $(
            println!(concat!(stringify!($value), ": {:?}"), $value);
        );*
    })
}

macro_rules! call_db {
    (
        req => $req:expr, 
        func => $func:expr,
        args => ( $($name:ident $value:expr),* )
    ) => ({
        let db = $req.db_conn();
        println!(concat!("Query: ", concat!("SELECT ", $func, "(", expand_sql_arguments!($($name),*), ");")));
        let stmt = db.prepare(sql!(concat!("SELECT ", $func, "(", expand_sql_arguments!($($name),*), ");"))).unwrap();
        let rows = match stmt.query(&[$(&$value),*]) {
            Ok(rows) => rows,
            Err(PgError::Db(err)) => badrequest!(err.message),
            Err(err) => badrequest!(err.to_string()),
        };
        let object: Value = match rows.get(0).get(0) {
            Some(value) => value,
            None => notfound!("Id not found (or no read access)".to_string())
        };
        object
    })
}


macro_rules! get_json_body {
    ($req:expr) => (
        get_json_body!($req, Value)
    );
    ($req:expr, $response_type:ty) => (
        match $req.get::<bodyparser::Struct<$response_type>>() {
            Ok(Some(body)) => body,
            Ok(None) => badrequest!("Please send some body!".to_string()),
            Err(bodyparser::BodyError { cause: bodyparser::BodyErrorCause::JsonError(err), ..}) => badrequest!(err.to_string()),
            Err(err) => badrequest!(err.to_string())
        }
    );
}

// Sadly we cann't move this to AfterMiddleware since that only exposes WriteBody.
fn caching(req: &Request, val: &Value) -> IronResult<Response> {
    // Sanity check, we cache only GET requests
    if req.method != Method::Get {
        return ok_json!(val);
    }
    let content = serde_json::to_string(&val).unwrap();
    let mut sha256 = Sha256::new();
    sha256.input_str(&content);
    let mut hashbytes = [0u8; 32]; //(sha256.output_bits() as u8 + 7) / 8]; // 32
    sha256.result(&mut hashbytes);
    let hash = hashbytes.to_base64(base64::URL_SAFE);
    let etag_header = Header(ETag(EntityTag::new(false, hash.to_owned())));
    let content_changed = match req.headers.get::<IfNoneMatch>() {
        None => true,
        Some(&IfNoneMatch::Any) => false,
        Some(&IfNoneMatch::Items(ref items)) => {
            let mut changed = true;
            for etag in items {
                if etag.tag() == hash {
                    changed = false;
                    break;
                }
            }
            changed
        }
    };
    if !content_changed {
        return Ok(Response::with((status::NotModified, etag_header)));
    }
    Ok(Response::with((status::Ok, content, etag_header)))
}

fn handle_login(req: &mut Request) -> IronResult<Response> {

    let login = get_json_body!(req, Login);

    ok_json!(&call_db!(
        req => req,
        func => "login",
        args => (
            emailaddress login.user,
            password     login.password
        )
    ))
}

// Returns a list of people, might be using filters.
fn handle_people_get(req: &mut Request) -> IronResult<Response> {
    // caching(&req, &get_db_json!(req, "people", get_token!(req), get_param!(req, "id", i32)))
    caching(&req, &call_db!(
        req => req,
        func => "people_get",
        args => (
            token     get_token!(req),
            people_id get_param!(req, "id", i32)
        )
    ))
}

fn handle_people_set(req: &mut Request) -> IronResult<Response> {
    ok_json!(&call_db!(
        req => req,
        func => "people_set",
        args => (
            token     get_token!(req),
            people_id get_param!(req, "id", i32),
            data      get_json_body!(req)
        )
    ))
}

fn handle_people_add(req: &mut Request) -> IronResult<Response> {
    // Create a new person. 
    ok_json!(&call_db!(
        req => req,
        func => "people_add",
        args => (
            token     get_token!(req),
            data      get_json_body!(req)
        )
    ))
}

fn handle_roles_get(req: &mut Request) -> IronResult<Response> {
    caching(&req, &call_db!(
        req => req,
        func => "roles_get",
        args => (
            token     get_token!(req),
            roles_id  get_param!(req, "id", i32)
        )
    ))
}

fn handle_roles_set(req: &mut Request) -> IronResult<Response> {
    ok_json!(&call_db!(
        req => req,
        func => "roles_set",
        args => (
            token     get_token!(req),
            roles_id  get_param!(req, "id", i32),
            data      get_json_body!(req)
        )
    ))
}

fn handle_roles_add(req: &mut Request) -> IronResult<Response> {
    // Create a new person. 
    ok_json!(&call_db!(
        req => req,
        func => "roles_add",
        args => (
            token     get_token!(req),
            data      get_json_body!(req)
        )
    ))
}   

fn handle_permissions_get(req: &mut Request) -> IronResult<Response> {
    caching(&req, &call_db!(
        req => req,
        func => "permissions_get",
        args => (
            token     get_token!(req),
            roles_id  get_param!(req, "id", i32)
        )
    ))
}

fn handle_fields_get(req: &mut Request) -> IronResult<Response> {

    let table = get_param!(req, "table", String);

    if table == "-1" {
        return caching(&req, &call_db!(
            req => req,
            func => "fields_get",
            args => (
                token get_token!(req)
            )
        ));
    } else {
        return caching(&req, &call_db!(
            req => req,
            func => "fields_get",
            args => (
                token get_token!(req),
                ref_table table
            )
        ));
    }
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

// TOKEN=$(curl http://localhost:4242/login -H "application/json" -d '{"user":"sammy@example.com","password":"1234"}' | jq '.token' -r)
// curl http://localhost:4242/people -H "Authorization: $TOKEN"  | jq '.'

fn main() {

    let router = router!(
        post "/login"      => handle_login,

        post "/people"     => handle_people_add,
        get  "/people"     => handle_people_get,
        get  "/people/:id" => handle_people_get,
        put  "/people/:id" => handle_people_set,

        post  "/roles"    => handle_roles_add,
        get  "/roles"     => handle_roles_get,
        get  "/roles/:id" => handle_roles_get,
        put  "/roles/:id" => handle_roles_set,

        // post "/permissions"     => handle_permissions_add,
        get  "/permissions"     => handle_permissions_get,
        get  "/permissions/:id" => handle_permissions_get,
        // put  "/permissions/:id" => handle_permissions_set,

        // post "/link"     => handle_link_add,
        // get  "/link"     => handle_link_get,
        // get  "/link/:id" => handle_link_get,
        // put  "/link/:id" => handle_link_set,

        get  "/fields"        => handle_fields_get,
        get  "/fields/:table" => handle_fields_get,
        put  "/fields"        => handle_fields_edit
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
