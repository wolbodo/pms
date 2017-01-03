#![feature(custom_derive, plugin, proc_macro)]
#![plugin(rocket_codegen)]
#![plugin(postgres_macros)]
extern crate rocket;
extern crate rocket_contrib;

#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate serde;

#[macro_use]
extern crate lazy_static;

extern crate r2d2;
extern crate r2d2_postgres;


use serde_json::Value;
use r2d2_postgres::{TlsMode, PostgresConnectionManager};

use rocket::Outcome;
use rocket::http::Status;
use rocket::request::{self, Request, FromRequest};
use rocket_contrib::JSON;
// use rocket::response::content::JSON;

lazy_static! {
    pub static ref DB_POOL: r2d2::Pool<r2d2_postgres::PostgresConnectionManager> = setup_db();
}

macro_rules! db_call {
  ($query:expr, $args:expr, $error:expr) => ({
    let db = connection();
    let stmt = db.prepare(
      sql!($query)
    ).unwrap();

    let rows = stmt.query($args).unwrap();

    let object: Value = match rows.get(0).get(0) {
        Some(value) => value,
        None => panic!($error)
    };
    JSON(object)
  })
}

fn setup_db() -> r2d2::Pool<r2d2_postgres::PostgresConnectionManager> {
    let config = r2d2::Config::default();
    let manager = PostgresConnectionManager::new("postgres://pms@%2Frun%2Fpostgresql", TlsMode::None).unwrap();
    r2d2::Pool::new(config, manager).unwrap()
}

fn connection() -> r2d2::PooledConnection<r2d2_postgres::PostgresConnectionManager> {
    let pool = DB_POOL.clone();
    pool.get().unwrap()
}


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



// Methods

#[derive(Serialize, Deserialize)]
struct Login {
    user: String,
    password: String
}

#[post("/login", data = "<login>")]
fn login(login: JSON<Login>) -> JSON<Value> {
  db_call!(
    "SELECT login(emailaddress := $1, password := $2);",
    &[&login.0.user, &login.0.password],
    "Id not found (or no read access)"
  )
}

#[post("/people", data = "<person>")]
fn people_add(token: APIToken, person: JSON<Value>) -> JSON<Value> {
  db_call!(
    "SELECT people_add(token := $1, data := $2);",
    &[&token.0, &person.0],
    "Id not found (or no read access)"
  )
}

#[get("/people")]
fn people_get(token: APIToken) -> JSON<Value> {
  db_call!(
    "SELECT people_get(token := $1);",
    &[&token.0],
    "Id not found (or no read access)"
  )
}

#[get("/people/<id>")]
fn people_get_i(token: APIToken, id: i32) -> JSON<Value> {
  db_call!(
    "SELECT people_get(token := $1, people_id := $2);",
    &[&token.0, &id],
    "Id not found (or no read access)"
  )
}

#[put("/people/<id>", data = "<person>")]
fn people_set_i(token: APIToken, id: i32, person: JSON<Value>) -> JSON<Value> {
  db_call!(
    "SELECT people_set(token := $1, people_id := $2, data := $3);",
    &[&token.0, &id, &person.0],
    "Id not found (or no read access)"
  )
}

#[post("/roles", data = "<role>")]
fn roles_add(token: APIToken, role: JSON<Value>) -> JSON<Value> {
  db_call!(
    "SELECT roles_add(token := $1, data := $2);",
    &[&token.0, &role.0],
    "Id not found (or no read access)"
  )
}

#[get("/roles")]
fn roles_get(token: APIToken) -> JSON<Value> {
  db_call!(
    "SELECT roles_get(token := $1);",
    &[&token.0],
    "Id not found (or no read access)"
  )
}

#[get("/roles/<id>")]
fn roles_get_i(token: APIToken, id: i32) -> JSON<Value> {
  db_call!(
    "SELECT roles_get(token := $1, roles_id := $2);",
    &[&token.0, &id],
    "Id not found (or no read access)"
  )
}

#[put("/roles/<id>", data = "<role>")]
fn roles_set(token: APIToken, id: i32, role: JSON<Value>) -> JSON<Value> {
  db_call!(
    "SELECT roles_set(token := $1, roles_id := $2, data := $3);",
    &[&token.0, &id, &role.0],
    "Id not found (or no read access)"
  )
}

#[get("/permissions")]
fn permissions_get(token: APIToken) -> JSON<Value> {
  db_call!(
    "SELECT roles_permissions_get(token := $1);",
    &[&token.0],
    "Id not found (or no read access)"
  )
}

#[get("/fields")]
fn fields_get(token: APIToken) -> JSON<Value> {
  db_call!(
    "SELECT fields_get(token := $1);",
    &[&token.0],
    "Id not found (or no read access)"
  )
}

#[get("/fields/<table>")]
fn fields_get_i(token: APIToken, table: String) -> JSON<Value> {
  db_call!(
    "SELECT fields_get(token := $1, ref_table := $2);",
    &[&token.0, &table],
    "Id not found (or no read access)"
  )
}

#[put("/fields")]
fn fields_set(token: APIToken) -> JSON<Value> {
  JSON(Value::Bool(false))
  // db_call!(
    // "SELECT fields_set(token := $1, people_id := $2, data := $3);",
    // &[&token.0, &id, &person.0],
    // "Id not found (or no read access)"
  // )
}



fn main() {
    rocket::ignite().mount("/", routes![
      login,
      people_add,
      people_get,
      people_get_i
    ]).launch();
}