extern crate iron;
extern crate bodyparser;
extern crate persistent;
extern crate rustc_serialize;
extern crate crypto;
extern crate router;
extern crate rand;
extern crate time;

use persistent::Read;
use iron::status;
use iron::prelude::*;
use router::{Router};
use rustc_serialize::json;

use crypto::digest::Digest;
use crypto::sha2::Sha256;
//use crypto::util::fixed_time_eq
use crypto::hmac::Hmac;
//use rand::Rng;
//use rand::os::OsRng;
//use std::iter::repeat;
use rustc_serialize::base64::{STANDARD, ToBase64};
use crypto::mac::Mac;
use rustc_serialize::hex::ToHex;
use std::mem;

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

#[derive(Debug, Clone, RustcDecodable, RustcEncodable)]
struct Auth {
    timestamp: i64,
    user_id: u32,
    signature: [u8; 32]
}

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

        Ok(Response::with((status::Ok)))
    }

}

fn handle_members(req: &mut Request) -> IronResult<Response> {
    unimplemented!();
    // Err(Response::with((status::Ok)));
}

fn handle_edit(req: &mut Request) -> IronResult<Response> {
    unimplemented!();
    // Err(Response::with((status::Ok)));
}

fn handle_create(req: &mut Request) -> IronResult<Response> {
    unimplemented!();
    // Err(Response::with((status::Ok)));
}

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {
    // let mut router = Router::new();  // Alternative syntax:

        //$msg = array('timestamp' => time(), 'id' => 42);
        //response(array('message' => $msg, 'signature' => hash_hmac('sha256', json_encode($msg), $secretKey)));
        let mut auth = Auth {timestamp: time::now_utc().to_timespec().sec, user_id: 3, signature: [0; 32]};

        //let mut gen = OsRng::new().ok().expect("Failed to get OS random generator");
        //let mut hmac_key: Vec<u8> = repeat(0u8).take(32).collect();
        //gen.fill_bytes(&mut hmac_key);
        let hmac_key = "password".as_bytes();
        println!("HMAC key: {}", hmac_key.to_base64(STANDARD));
        println!("timestamp: {}", auth.timestamp);
        let mut hmac = Hmac::new(Sha256::new(), &hmac_key);
        unsafe {
            //let bytes = auth.timestamp as [u8; 8];
            hmac.input(&mem::transmute::<i64, [u8; 8]>(auth.timestamp));
            hmac.input(&mem::transmute::<u32, [u8; 4]>(auth.user_id));
        }
        for (&x, p) in hmac.result().code().iter().zip(auth.signature.iter_mut()) {
            *p = x;
        }
        //auth.signature = hmac.result().code()[0 .. 32];
        //auth.signature = hmac.result().code() as [u8; 32];
        //std::slice::from_raw_partimestamp(hmac.result().code() as u8, 32);
        //hmac.input(message.as_bytes());
        println!("json {}", json::encode(&auth).unwrap());
        unsafe { println!("base64 {}", mem::transmute::<Auth, [u8; 48]>(auth).to_base64(STANDARD));}
        println!("HMAC digest: {}", hmac.result().code().to_hex());


    let router = router!(
        post "/login" => handle_login,
        get "/members" => handle_members,
        put "/member/:id" => handle_edit,
        post "/member/new" => handle_create
    );

    let mut chain = Chain::new(router);
    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    Iron::new(chain).http("localhost:3000").unwrap();
}
