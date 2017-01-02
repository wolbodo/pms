
extern crate r2d2_postgres;

use r2d2_postgres::{TlsMode, PostgresConnectionManager, r2d2};


/// Iron middleware that allows for postgres connections within requests.
pub struct PostgresMiddleware {
  /// A pool of postgres connections that are shared between requests.
  pub pool: Arc<r2d2::Pool<r2d2_postgres::PostgresConnectionManager>>,
}

pub struct Value(Arc<r2d2::Pool<r2d2_postgres::PostgresConnectionManager>>);

impl typemap::Key for PostgresMiddleware { type Value = Value; }

impl PostgresMiddleware {

  /// Creates a new pooled connection to the given postgresql server. The URL is in the format:
  ///
  /// ```{none}
  /// postgresql://user[:password]@host[:port][/database][?param1=val1[[&param2=val2]...]]
  /// ```
  ///
  /// Returns `Err(err)` if there are any errors connecting to the postgresql database.
  pub fn new(pg_connection_str: &str) -> Result<PostgresMiddleware, Box<Error>> {
    let config = r2d2::Config::builder()
        .error_handler(Box::new(r2d2::LoggingErrorHandler))
        .build();
    let manager = try!(PostgresConnectionManager::new(pg_connection_str, TlsMode::None));
    let pool = Arc::new(try!(r2d2::Pool::new(config, manager)));
    Ok(PostgresMiddleware {
      pool: pool,
    })
  }
}