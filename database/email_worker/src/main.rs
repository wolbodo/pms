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

use dotenv::dotenv;
use std::env;

use mustache::{Data};

use postgres::{Connection, TlsMode};
use postgres::error::Error as PgError;

use serde_json::Value;
use serde_json::value;

use fallible_iterator::FallibleIterator;
use chan_signal::Signal;

use lettre::email::EmailBuilder;
use lettre::transport::EmailTransport;
use lettre::transport::smtp::{SecurityLevel, SmtpTransport, SmtpTransportBuilder};

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    gid: i32
}

#[derive(Serialize, Deserialize, Debug)]
struct SimpleError {
    error: String
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
    let (thread_sender, main_receiver) = chan::sync(0);
    let (main_sender, thread_receiver) = chan::sync(0);

    let worker_thread = thread::spawn(move || notify_worker(thread_sender, thread_receiver));

    chan_select! {
        signal.recv() -> signal => {
            println!("received signal: {:?}, sending exit to worker thread", signal);
            main_sender.send(());
            worker_thread.join().unwrap();
            println!("worker thread exited");
        },
        main_receiver.recv() => {
            panic!("Worker thread stopped, this should not happen (restart?)");
        }
    }
    println!("Clean exit.");
}

macro_rules! get_env_var {
    ($name:expr, $default:expr) => (match env::var($name) {
        Ok(ref s) => s.as_str(),
        Err(_) => $default
    })
}

macro_rules! email_error {
    ($gid:expr, $error:expr, $connection:expr) => ({
        let err = serde_json::to_value(&SimpleError{error: $error});
        match $connection.execute(
            sql!("SELECT queue_error(gid := $1, error := $2)"),
            &[&$gid, &err]
        ) {
            Ok(_) => println!("Error: {:?}", err),
            Err(err) => panic!(format!("error handling error {:?}", err)) // Probably should just error log and return....
        };
        return
    })
}


fn handle_email(connection: &Connection, mailer: &mut SmtpTransport, message: Message) {

    // Claim the email in the database
    println!("Claiming email: {:?}", message);
    match connection.execute(
        sql!("SELECT queue_claim(gid := $1, worker_id := $2)"),
        &[&message.gid, &"email_worker-1"]
    ) {
        Ok(_) => (),
        Err(err) => return println!("error claiming email {:?}", err) // Probably should just error log and return....
    };

    // Fetch the email from the db.
    let stmt = match connection.prepare(sql!("SELECT fetch_email_context(email_gid := $1)")) {
        Ok(stmt) => stmt,
        Err(err) => email_error!(message.gid, format!("preparing statement {:?}", err), connection)
    };

    let rows = match stmt.query(&[&message.gid]) {
        Ok(rows) => rows,
        Err(PgError::Db(err)) => email_error!(message.gid, format!("pgerror({:?})", err), connection),
        Err(err) => email_error!(message.gid, format!("othererr({:?})", err), connection),
    };
    let object: Value = match rows.get(0).get(0) {
        Some(value) => {
            let mut mutvalue : value::Map<String,Value> = value::from_value(value).unwrap();
            mutvalue.insert(
                "hostname".to_string(),
                value::to_value(get_env_var!("PMS_BASE_URL", "http://localhost:4242")),
            );
            value::to_value(mutvalue)
        },
        None => email_error!(message.gid, format!("Id not found (or no read access)"), connection)
    };

    // println!("{:?}", object);
    let template_path = match object.pointer("/template") {
        Some(&Value::String(ref string)) => format!("templates/{}.mustache", string),
        _ => email_error!(message.gid, format!("Email template not found"), connection)
    };
    let template = match mustache::compile_path(Path::new(template_path.as_str())) {
        Ok(t) => t,
        Err(err) => email_error!(message.gid, format!("Template error: {:?}", err), connection)
    };

    let mustache_value = value_to_mustache(object.clone());
    let mut buf = Vec::new();
    match template.render_data(&mut buf, &mustache_value) {
        Ok(_) => println!("Rendered template"),
        Err(err) => email_error!(message.gid, format!("Rendering template {:?}", err), connection),
    };

    let email_address = match object.pointer("/email") {
        Some(&Value::String(ref string)) => string.as_str(),
        _ => ""
    };

    let email_subject = match object.pointer("/data/subject") {
        Some(&Value::String(ref string)) => string.as_str(),
        _ => "Email from PMS"
    };


    println!("Emailing to: {:?}", email_address);
    let email = match EmailBuilder::new()
                .to(email_address)
                .from("server@wlbd.nl")
                .subject(email_subject)
                .html(match String::from_utf8(buf) {
        Ok(ref string) => string.as_str(),
        Err(err) => email_error!(message.gid, format!("failed converting vec into string {:?}", err), connection)
    })
                .build() {
        Ok(email) => email,
        Err(err) => email_error!(message.gid, format!("Failed building email {:?}", err), connection)
    };

    let result = mailer.send(email);

    if result.is_ok() {
        println!("Email sent");

        match connection.execute(
            sql!("SELECT queue_done(gid := $1)"),
            &[&message.gid]
        ) {
            Ok(_) => (),
            Err(err) => return println!("error claiming email {:?}", err) // Probably should just error log and return....
        };
        
    } else {
        println!("Could not send email: {:?}", result);
        email_error!(message.gid, format!("Could not send email: {:?}", result), connection);
    }
}

fn notify_worker(_thread_sender: chan::Sender<()>, thread_receiver: chan::Receiver<()>) {
    let connection = match Connection::connect("postgres://pms@%2Frun%2Fpostgresql", TlsMode::None) {
        Ok(connection) => connection,
        Err(err) => panic!(format!("Error connecting to database{:?}", err))
    };
    match connection.execute(sql!("LISTEN worker_queue"), &[]) {
        Ok(_) => println!("Successfully listening to worker_queue"),
        Err(err) => panic!(format!("Error listening {:?}", err))
    };
    
    println!("Connceting to: {:?} {:?}", 
        get_env_var!("SMTP_HOST", "127.0.0.1"),
        u16::from_str_radix(get_env_var!("SMTP_PORT", "25"), 10).unwrap()
    );

    // Connect to a remote server on a custom port
    let mut mailer = match SmtpTransportBuilder::new((
        get_env_var!("SMTP_HOST", "127.0.0.1"),
        u16::from_str_radix(get_env_var!("SMTP_PORT", "25"), 10).unwrap()
    )) {
        Ok(mailer) => mailer,
        Err(err) => panic!(format!("Cannot create conncetion to smtp server {:?}", err))
    }   // Set the name sent during EHLO/HELO, default is `localhost`
        // .hello_name("localhost")
        // Add credentials for authentication
        .credentials(get_env_var!("SMTP_USER", "user@example.com"), get_env_var!("SMTP_PASSWORD", "password"))
        // Specify a TLS security level. You can also specify an SslContext with
        // .ssl_context(SslContext::Ssl23)
        .security_level(SecurityLevel::AlwaysEncrypt)
        // Enable SMTPUTF8 if the server supports it
        .smtp_utf8(true)
        // Configure expected authentication mechanism
        // .authentication_mechanism(Mechanism::CramMd5)
        // Enable connection reuse
        .connection_reuse(true).build();

    {
        let notifications = connection.notifications();

        loop {
            chan_select! {
                default => {
                    let mut it = notifications.timeout_iter(Duration::from_secs(15));
                    while match it.next() {
                        Ok(Some(msg)) => {
                            let payload = msg.payload;
                            // intersting issues with serde_json: {"gid": 4.3} => 4 (no error), {"gid": "4"} => 4 (no error), {"gid": "4.3"} => Error.
                            // I would like the no errors to be Errors too.
                            let deserialized: Message = serde_json::from_str(&payload).unwrap();

                            println!("{0}; {1}", payload, deserialized.gid);
                            handle_email(&connection, &mut mailer, deserialized);
                            true
                        },
                        Err(err) => panic!(format!("Error getting notification {:?}", err)),
                        _ => false
                    } {};
                },
                thread_receiver.recv() => break,
            }
        }
    }

    mailer.close();
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
