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
// extern crate rand;
// extern crate time;
extern crate postgres;
extern crate iron_postgres_middleware as pg_middleware;
extern crate rustc_serialize;

use persistent::Read;
use iron::status;
use hyper::header::Authorization;

use iron::prelude::*;
// use router::{Router};
//use std::collections::BTreeMap;
use serde_json::*;
use pg_middleware::{PostgresMiddleware, PostgresReqExt};
use postgres::error::Error as PgError;

// use crypto::digest::Digest;
// use crypto::sha2::Sha256;
//use crypto::util::fixed_time_eq
// use crypto::hmac::Hmac;
//use rand::Rng;
//use rand::os::OsRng;
//use std::iter::repeat;
// use rustc_serialize::base64::{STANDARD, ToBase64};
// use crypto::mac::Mac;
// use std::mem;

// #[derive(Serialize, Deserialize, Debug)]
#[derive(Debug, Clone, RustcDecodable)]
struct Login {
   user: String,
   password: String,
}

// #[derive(Debug, Clone, RustcDecodable, RustcEncodable)]
// struct Auth {
//     timestamp: i64,
//     user_id: u32,
//     signature: [u8; 32]
// }

const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;

#[derive(Serialize, Deserialize, Debug)]
struct SimpleError {
    error: String
}

/*macro_rules! itry {
    ($e:expr, $err:expr) => (match $e {
        Result::Ok(val) => val,
        Result::Err(err) => {
            return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError { error: $err }).unwrap())))
        }
    })
}*/

fn handle_login(req: &mut Request) -> IronResult<Response> {
    let db = req.db_conn();
    //note bodyparser is still using rustc_serialize, not serde_json!
    //let test = match req.get::<bodyparser::Struct<Login>>().unwrap();

    let body = match req.get::<bodyparser::Json>() {//core::result::Result<core::option::Option<rustc_serialize::json::Json>, bodyparser::errors::BodyError>
        Ok(Some(body)) => body,
        Ok(None) => return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: "err please send some body!".to_owned()}).unwrap()))),
        Err(err) => return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: err.to_string()}).unwrap())))
    };
    let json = match body.as_object() {
        Some(json) => json,
        None => return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: "No JSON object found".to_owned()}).unwrap())))
    }; //we cannot combine this on one line with the line above (since 'borrowed value does not live long enough')

    let stmt = db.prepare(sql!("SELECT login(emailaddress := $1, password := $2);")).unwrap();

    let rows = match stmt.query(&[
        &json.get("user").unwrap().as_string().unwrap(), 
        &json.get("password").unwrap().as_string().unwrap()
    ]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: err.message}).unwrap()))),
        Err(err) => return Ok(Response::with((status::BadRequest, serde_json::to_string(&SimpleError{error: err.to_string()}).unwrap()))),
    };

    //for status codes, please consult http://racksburg.com/choosing-an-http-status-code/

    //let mut userContext = BTreeMap::new();
    //userContext
    let token: String = rows.get(0).get(0);
    Ok(Response::with((status::Ok, token)))

    // todo: fail case ;)
}

fn handle_members(req: &mut Request) -> IronResult<Response> {
    // Returns a list of members, might be using filters. 

    let db = req.db_conn();

    let token = match req.headers.get::<Authorization<String>>() {
        Some(&Authorization(ref token)) => token.clone().to_string(),
        None => "".to_string()
    };

    println!("Authorization token: {}", token);

    let stmt = db.prepare("SELECT getpeople(token := $1);").unwrap();
    let rows = stmt.query(&[&token]).unwrap();

    let mut members: Vec<Value> = Vec::new();

    for row in rows.iter() {
        println!("{:?}", row);
        
        let data: Value = row.get("getpeople");
        println!("{:?}", data);

        members.push(data);
    }

    Ok(Response::with((status::Ok, serde_json::to_string(&members).unwrap())))
    // // Err(Response::with((status::Ok)));
}

fn handle_edit(_: &mut Request) -> IronResult<Response> {
    // Update an existing member.

    Ok(Response::with((status::Ok)))
}

fn handle_create(_: &mut Request) -> IronResult<Response> {
    // Create a new member. 

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
        get "/members" => handle_members,
        put "/member/:id" => handle_edit,
        get "/fields" => handle_fields,
        put "/fields" => handle_fields_edit,
        post "/member/new" => handle_create
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
