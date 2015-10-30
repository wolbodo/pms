extern crate iron;
extern crate bodyparser;
extern crate persistent;
extern crate rustc_serialize;
extern crate crypto;
extern crate router;

use persistent::Read;
use iron::status;
use iron::prelude::*;
use router::{Router};
use rustc_serialize::json;

//use crypto::digest::Digest;
//use crypto::sha2::Sha256;
//use crypto::util::fixed_time_eq

// Iron router macro ?why
macro_rules! router {
    ($($method:ident $glob:expr => $handler:expr),+ $(,)*) => ({
        let mut router = Router::new();
        $(router.$method($glob, $handler);)*
        router
    });
}

#[derive(Debug, Clone, RustcDecodable, RustcEncodable)]
struct Login {
    user: String,
    password: String,
}
//let mut hasher = Sha256::new();
//hasher.input_str("hello world");
//let hex = hasher.result_str();

const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;


fn handle_login(req: &mut Request) -> IronResult<Response> {
    let login = match req.get::<bodyparser::Struct<Login>>() {
        Ok(Some(x)) => x,//println!("Parsed body:\n{:?}", login),
        Ok(None) => return Ok(Response::with((status::BadRequest))),//println!("No postdata"),
        Err(_err) => return Ok(Response::with((status::BadRequest)))//println!("Error: {:?}", err)
    };

    if login.user == "invalid" {
        let peanut = Login {user: "Peanut".to_string(), password: "Yes, you are".to_string()};
        let payload = json::encode(&peanut).unwrap();

        Ok(Response::with((status::ImATeapot, payload)))
    } else {
    //$msg = array('timestamp' => time(), 'id' => 42);
    //response(array('message' => $msg, 'signature' => hash_hmac('sha256', json_encode($msg), $secretKey)));
        Ok(Response::with((status::Ok)))
    }

}

fn handle_members(req: &mut Request) -> IronResult<Response> {
    // Returns a list of members, might be using filters. 

    unimplemented!();
    // Err(Response::with((status::Ok)));
}

fn handle_edit(req: &mut Request) -> IronResult<Response> {
    // Update an existing member.

    unimplemented!();
    // Err(Response::with((status::Ok)));
}

fn handle_create(req: &mut Request) -> IronResult<Response> {
    // Create a new member. 


    unimplemented!();
    // Err(Response::with((status::Ok)));
}

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {
    // let mut router = Router::new();  // Alternative syntax:

    let router = router!(
        post "/login" => handle_login,
        get "/members" => handle_members,
        put "/member/:id" => handle_edit,
        post "/member/new" => handle_create
    );

    let mut chain = Chain::new(router);
    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    Iron::new(chain).http("localhost:4242").unwrap();
}
