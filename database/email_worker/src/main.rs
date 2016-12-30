#![feature(custom_derive, plugin, proc_macro)] #![plugin(postgres_macros)]

extern crate postgres;
extern crate fallible_iterator;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate chan;
extern crate chan_signal;
extern crate mustache;
extern crate lettre;
extern crate dotenv;


use std::path::Path;
use std::thread;
use std::time::Duration;
use std::collections::HashMap;
use std::io;

use dotenv::dotenv;
use std::env;

use mustache::{Data};

use postgres::{Connection, TlsMode};
use postgres::error::Error as PgError;

use serde_json::Value;

use fallible_iterator::FallibleIterator;
use chan_signal::Signal;

use lettre::email::EmailBuilder;
use lettre::transport::EmailTransport;
use lettre::transport::smtp::{SecurityLevel, SmtpTransport, SmtpTransportBuilder};

// use std::sync::atomic::AtomicBool;

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    gid: i32
}


fn value_to_mustache(value: Value) -> Data {
    // Turns a serde_json::Value into mustache::Data

    return match value {
        Value::Null => Data::StrVal("".to_string()),
        Value::Bool(val) => Data::Bool(val),
        Value::I64(val) => Data::StrVal(val.to_string()),
        Value::U64(val) => Data::StrVal(val.to_string()),
        Value::F64(val) => Data::StrVal(val.to_string()),
        Value::String(val) => Data::StrVal(val.to_string()),
        Value::Array(vector) => {
            let mut _new = Vec::new();
            for item in vector.into_iter() {
                _new.push(value_to_mustache(item));
            }
            Data::VecVal(_new)
        },
        Value::Object(object) => {
            let mut _new = HashMap::new();
            for (key, val) in object.iter() {
                _new.insert(key.clone(), value_to_mustache(val.clone()));
            }
            Data::Map(_new)
        },
    }
}

fn main() {
    dotenv().ok();

    let signal = chan_signal::notify(&[Signal::INT, Signal::TERM]);
    let (sender, receiver) = chan::sync(0);

    thread::spawn(move || notify_worker(sender));

    chan_select! {
        signal.recv() -> signal => {
            println!("received signal: {:?}", signal)
        },
        receiver.recv() => {
            println!("Program completed normally.");
        }
    }
    println!("Clean exit.");
}

fn handle_email(connection: &Connection, mailer: &mut SmtpTransport, message: Message) {

    // Fetch the email from the db.
    let stmt = connection.prepare(sql!("SELECT fetch_email_context(email_gid := $1)")).unwrap();

    let rows = match stmt.query(&[&message.gid]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => panic!("pgerror({:?})", err),
        Err(err) => panic!("othererr({:?})", err),
    };
    let object: Value = match rows.get(0).get(0) {
        Some(value) => value,
        None => panic!("Id not found (or no read access)".to_string())
    };

    let template = mustache::compile_path(Path::new("templates/test.mustache")).unwrap();

    let mustache_value = value_to_mustache(object.clone());
    let mut buf = Vec::new();
    template.render_data(&mut buf, &mustache_value).unwrap();

    let email = EmailBuilder::new()
                .to("a.esselink@gmail.com")
                .from("server@dxlb.nl")
                .subject("TESTING")
                .body(String::from_utf8(buf).unwrap().as_str())
                .build()
                .unwrap();

    let result = mailer.send(email);

    if result.is_ok() {
        println!("Email sent");
    } else {
        println!("Could not send email: {:?}", result);
    }
}

fn notify_worker(_sender: chan::Sender<()>) {

    let connection = Connection::connect("postgres://pms@%2Frun%2Fpostgresql", TlsMode::None).unwrap();
    connection.execute(sql!("LISTEN worker_queue"), &[]).unwrap();
    let notifications = connection.notifications();


    // Connect to a remote server on a custom port
    let mut mailer = SmtpTransportBuilder::new((env::var("SMTP_HOST").unwrap().as_str(), 587)).unwrap()
        // Set the name sent during EHLO/HELO, default is `localhost`
        // .hello_name("localhost")
        // Add credentials for authentication
        .credentials(env::var("SMTP_USER").unwrap().as_str(), env::var("SMTP_PASSWORD").unwrap().as_str())
        // Specify a TLS security level. You can also specify an SslContext with
        // .ssl_context(SslContext::Ssl23)
        .security_level(SecurityLevel::AlwaysEncrypt)
        // Enable SMTPUTF8 if the server supports it
        .smtp_utf8(true)
        // Configure expected authentication mechanism
        // .authentication_mechanism(Mechanism::CramMd5)
        // Enable connection reuse
        .connection_reuse(true).build();


    //timeout_iter & check None/Some/Err + None + signal-exit => exit
    loop {
        let mut it = notifications.timeout_iter(Duration::from_secs(15));
        while match it.next().unwrap() {
            Some(msg) => {
                let payload = msg.payload;
                // intersting issues with serde_json: {"gid": 4.3} => 4 (no error), {"gid": "4"} => 4 (no error), {"gid": "4.3"} => Error.
                // I would like the no errors to be Errors too.
                let deserialized: Message = serde_json::from_str(&payload).unwrap();

                println!("{0}; {1}", payload, deserialized.gid);
                handle_email(&connection, &mut mailer, deserialized);
                true
            },
            _ => false
        } {};
    }

    connection.finish().unwrap();
}

// handle LOTS of corner cases.. (and match unwraps + log to stderr? + log to stdout to syslog) or https://github.com/Geal/rust-syslog log.warning|err|notice|debug(msg); ?
// loop
    // parse json
    // fetch/lock records (with gid) - processing
    // make email mime message
    // send email over smtp
    // set record to ok

//include systemd startup script, e.g.:
