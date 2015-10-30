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
use crypto::digest::Digest;
use crypto::sha2::Sha256;


/*#[derive(Debug, Clone, RustcDecodable)]
struct MyStructure {
    name: String,
    age: Option<String>,
}*/

fn log_body(req: &mut Request) -> IronResult<Response> {

    Ok(Response::with(status::Ok))
}
    //let mut hasher = Sha256::new();
    //hasher.input_str("hello world");
    //let hex = hasher.result_str();


const MAX_BODY_LENGTH: usize = 1024 * 1024 * 10;

// `curl -i "localhost:3000/" -H "application/json" -d '{"name":"jason","age":"2"}'`
// and check out the printed json in your terminal.
fn main() {
    let mut router = Router::new();  // Alternative syntax:
    router.get("/", handler);        // let router = router!(get "/" => handler,
    router.post("/:query", handler);  //                      get "/:query" => handler);

    fn handler(req: &mut Request) -> IronResult<Response> {
        //let ref query = req.extensions.get::<Router>()
        //    .unwrap().find("query").unwrap_or("/");


        let body = req.get::<bodyparser::Raw>();
        /*match body {
            Ok(Some(body)) => println!("Read body:\n{}", body),
            Ok(None) => println!("No body"),
            Err(err) => println!("Error: {:?}", err)
        }*/

        let json_body = req.get::<bodyparser::Json>();
        match json_body {
            Ok(Some(json_body)) => println!("Parsed body:\n{:?}", json_body),
            Ok(None) => println!("No body"),
            Err(err) => println!("Error: {:?}", err)
        }

        /*let struct_body = req.get::<bodyparser::Struct<MyStructure>>();
        match struct_body {
            Ok(Some(struct_body)) => println!("Parsed body:\n{:?}", struct_body),
            Ok(None) => println!("No body"),
            Err(err) => println!("Error: {:?}", err)
        }*/


        //Ok(Response::with((status::Ok, *query)))
        Ok(Response::with((status::Ok)))
    }

    let mut chain = Chain::new(router);
    chain.link_before(Read::<bodyparser::MaxBodyLength>::one(MAX_BODY_LENGTH));
    Iron::new(chain).http("localhost:3000").unwrap();
}

/*


fn main() {

    Iron::new(router).http("localhost:3000").unwrap();

}*/