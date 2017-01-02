#![feature(plugin)]
#![plugin(rocket_codegen)]
extern crate rocket;
extern crate serde_json;

#[macro_use]
extern crate lazy_static;

extern crate r2d2;
extern crate r2d2_postgres;

use r2d2_postgres::PostgresConnectionManager;

use rocket::Outcome;
use rocket::http::Status;
use rocket::request::{self, Request, FromRequest};

struct APIToken(String);

impl<'a, 'r> FromRequest<'a, 'r> for APIToken {
    type Error = ();

    fn from_request(request: &'a Request<'r>) -> request::Outcome<APIToken, ()> {
        let keys: Vec<_> = request.headers().get("Authorization").collect();
        if keys.len() != 1 {
            return Outcome::Failure((Status::BadRequest, ()));
        }

        let key = keys[0];
        if key == "test" {
            return Outcome::Forward(());
        }

        return Outcome::Success(APIToken(key.to_string()));
    }
}



lazy_static! {
    pub static ref DB_POOL: r2d2::Pool<r2d2_postgres::PostgresConnectionManager> = setup_db();
}


pub struct Thing {
    pub id: i32,
    pub name: String
}

fn setup_db() -> r2d2::Pool<r2d2_postgres::PostgresConnectionManager> {
    let config = r2d2::Config::default();
    let manager = PostgresConnectionManager::new("postgres://pms@%2Frun%2Fpostgresql");
    r2d2::Pool::new(config, manager).unwrap()
}

fn connection() -> r2d2::PooledConnection<r2d2_postgres::PostgresConnectionManager> {
    let pool = DB_POOL.clone();
    pool.get().unwrap()
}




// Methods

#[post("/login")]
fn login(token: APIToken) -> String {
  format!("Hello, {}!", token.0)
           // post "/login"           => handle_login,
}

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/hello/<name>")]
fn hello(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[get("/user/<id>")]
fn user(id: usize) -> String {
    format!("user {}!", id)
}

#[get("/user/<id>", rank = 3)]
fn user_str(id: &str) -> String {
    format!("user_str {}!", id)
}


fn main() {
    rocket::ignite().mount("/", routes![
      index,
      hello,
      user,
      user_str,login,login_null
    ]).launch();
}