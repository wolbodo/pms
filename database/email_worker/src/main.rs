#![feature(custom_derive, plugin, proc_macro)]
#![plugin(postgres_macros)]

extern crate postgres;
extern crate fallible_iterator;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate chan;
extern crate chan_signal;

use postgres::{Connection, TlsMode};
use fallible_iterator::FallibleIterator;
use std::time::Duration;
use std::thread;
use chan_signal::Signal;

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    gid: i64
}


fn main() {

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

fn notify_worker(_thread_sender: chan::Sender<()>, thread_receiver: chan::Receiver<()>) {
    let connection = Connection::connect("postgres://pms@%2Frun%2Fpostgresql", TlsMode::None).unwrap();
    connection.execute(sql!("LISTEN channelname"), &[]).unwrap();
    
    {
        let notifications = connection.notifications();

        //timeout_iter & check None/Some/Err + None + signal-exit => exit
        loop {
            chan_select! {
                default => {
                    let mut it = notifications.timeout_iter(Duration::from_secs(15));
                    while match it.next().unwrap() {
                        Some(msg) => {
                            let payload = msg.payload;
                            // intersting issues with serde_json: {"gid": 4.3} => 4 (no error), {"gid": "4"} => 4 (no error), {"gid": "4.3"} => Error.
                            // I would like the no errors to be Errors too.
                            let deserialized: Message = serde_json::from_str(&payload).unwrap();

                            println!("{0}; {1}", payload, deserialized.gid);
                            true
                        },
                        _ => false
                    } {};
                },
                thread_receiver.recv() => { break; },
            }
        }
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
