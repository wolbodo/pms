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
//use crypto::digest::Digest;
//use crypto::sha2::Sha256;
//use crypto::util::fixed_time_eq


#[derive(Debug, Clone, RustcDecodable)]
struct Login {
    user: String,
    password: String,
}
//let mut hasher = Sha256::new();
//hasher.input_str("hello world");
//let hex = hasher.result_str();

const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;

fn handleLogin(login: Login) -> IronResult<Response> {
    if login.user == "invalid" {
        Ok(Response::with((status::ImATeapot, "test")))
    } else {
    //$msg = array('timestamp' => time(), 'id' => 42);
    //response(array('message' => $msg, 'signature' => hash_hmac('sha256', json_encode($msg), $secretKey)));
        Ok(Response::with((status::Ok)))
    }
}

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {
    let mut router = Router::new();  // Alternative syntax:
    //router.get("/", handler);        // let router = router!(get "/" => handler,
    router.post("/token", token);  //                      get "/:query" => handler);

    fn token(req: &mut Request) -> IronResult<Response> {
        let login = req.get::<bodyparser::Struct<Login>>();
        match login {
            Ok(Some(login)) => handleLogin(login),//println!("Parsed body:\n{:?}", login),
            Ok(None) => Ok(Response::with((status::BadRequest))),//println!("No postdata"),
            Err(err) => Ok(Response::with((status::BadRequest)))//println!("Error: {:?}", err)
        }
    }

    let mut chain = Chain::new(router);
    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    Iron::new(chain).http("localhost:3000").unwrap();
}

/*


fn main() {

    Iron::new(router).http("localhost:3000").unwrap();

}*/