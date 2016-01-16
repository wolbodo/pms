extern crate iron;
extern crate bodyparser;
extern crate persistent;
extern crate serde;
extern crate serde_json;
#[macro_use(router)] extern crate router;
// extern crate rand;
// extern crate time;
extern crate postgres;
extern crate iron_postgres_middleware as pg_middleware;

use persistent::Read;
use iron::status;
use iron::{BeforeMiddleware};
use iron::prelude::*;
// use router::{Router};
use std::collections::BTreeMap;
use serde_json::*;
use postgres::{Connection, SslMode};
use pg_middleware::{PostgresMiddleware, PostgresReqExt};

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

/*#[derive(Debug, Clone, RustcDecodable, RustcEncodable)]
struct Login {
    user: String,
    password: String,
}*/

// #[derive(Debug, Clone, RustcDecodable, RustcEncodable)]
// struct Auth {
//     timestamp: i64,
//     user_id: u32,
//     signature: [u8; 32]
// }


const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;

fn handle_login(req: &mut Request) -> IronResult<Response> {

    let db = req.db_conn();
    let stmt = db.prepare("SELECT login(emailaddress := $1, password := $2);").unwrap();
    let rows = stmt.query(&[&"test@example.com", &"1234"]).unwrap();

    //let mut userContext = BTreeMap::new();
    //userContext
    let token: String = rows.get(0).get(0);
    Ok(Response::with((status::Ok, token)))

    // todo: fail case ;)
}

fn handle_members(req: &mut Request) -> IronResult<Response> {
    // Returns a list of members, might be using filters. 

    let db = req.db_conn();
    let stmt = db.prepare("
        WITH readfields (key, selfid) AS (
            SELECT DISTINCT fields.name, CASE WHEN groups.name = 'self' THEN people.id END FROM
                fields JOIN permissions ON  permissions.ref_key = 'field' AND permissions.ref_value = fields.id AND permissions.valid_till IS NULL AND fields.valid_till IS NULL
                       JOIN groups_permissions ON permissions.id = groups_permissions.permissions_id AND groups_permissions.valid_till IS NULL
                       JOIN groups ON groups.id = groups_permissions.groups_id AND groups.valid_till IS NULL
                       JOIN people_groups ON (people_groups.groups_id = groups.id OR groups.name = 'self') AND people_groups.valid_till IS NULL
                       JOIN people ON people_groups.people_id = people.id AND people.valid_till IS NULL
                WHERE permissions.type = 'read' AND permissions.ref_type = 'people' AND people.id = $1
        )
        SELECT ('{' || (
            SELECT STRING_AGG('\"' || key || '\":' || TO_JSON(value), ',')
            FROM (SELECT * FROM JSONB_EACH(data) UNION
                VALUES
                    ('gid'::TEXT, TO_JSON(gid)::JSONB),
                    ('id', TO_JSON(id)::JSONB),
                    ('valid_from', TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_from)))::JSONB),
                    ('valid_till', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_till)))::JSONB, 'null'::JSONB)),
                    ('email', COALESCE(TO_JSON(email)::JSONB, 'null'::JSONB)),
                    ('phone', COALESCE(TO_JSON(phone)::JSONB, 'null'::JSONB)),
                    ('password_hash', COALESCE(TO_JSON(password_hash)::JSONB, 'null'::JSONB)),
                    ('modified_by', TO_JSON(modified_by)::JSONB),
                    ('modified', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM modified)))::JSONB, 'null'::JSONB)),
                    ('created', TO_JSON(FLOOR(EXTRACT(EPOCH FROM created)))::JSONB)
                ) alias
                WHERE key IN (SELECT key FROM readfields WHERE selfid IS NULL OR people.id = selfid))  || '}')::JSONB
            FROM people WHERE valid_till IS NULL;"
        ).unwrap();

    let rows = stmt.query(&[&3]).unwrap();

    let mut members: Vec<Value> = Vec::new();

    // for row in rows {

    //     let data: Value = row.get("jsonb");
    //     println!("{:?}", data);

    //     members.push(data);
    // }

    Ok(Response::with((status::Ok, serde_json::to_string(&members).unwrap())))
    // // Err(Response::with((status::Ok)));
}

fn handle_edit(req: &mut Request) -> IronResult<Response> {
    // Update an existing member.

    Ok(Response::with((status::Ok)))
}

fn handle_create(req: &mut Request) -> IronResult<Response> {
    // Create a new member. 

    Ok(Response::with((status::Ok)))
}

fn handle_fields(req: &mut Request) -> IronResult<Response> {
    // Return fields. 

    Ok(Response::with((status::Ok)))
}

fn handle_fields_edit(req: &mut Request) -> IronResult<Response> {
    // Update fields, admin only. 

    Ok(Response::with((status::Ok)))
}

struct Auth;
impl BeforeMiddleware for Auth {
    fn before(&self, _: &mut Request) -> IronResult<()> {
        println!("before called");
        Ok(())
    }

    fn catch(&self, _: &mut Request, err: IronError) -> IronResult<()> {
        println!("catch called");
        Err(err)
    }
}


// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {


    let router = router!(
        post "/login" => handle_login,
        get "/login" => handle_login,
        get "/members" => handle_members,
        put "/member/:id" => handle_edit,
        get "/fields" => handle_fields,
        put "/fields" => handle_fields_edit,
        post "/member/new" => handle_create
    );

    let mut chain = Chain::new(router);

    println!("Connecting to database.");
    // for unix domain sockets use: %2Frun%2Fpostgresql%2F9.4-main.pid
    let pg_middleware = PostgresMiddleware::new("postgres://postgres@postgres/pms").unwrap();
    println!("Connected.");

    chain.link_before(pg_middleware);
    let auth = Auth;
    chain.link_before(auth);
    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    Iron::new(chain).http("0.0.0.0:4242").unwrap();
}
