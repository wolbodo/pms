#!/bin/bash

# trap ctrl-c and call ctrl_c()
trap stop_runner INT


function build_run() {
	cargo build
	kill_runner
	cargo run &
}

function stop_runner() {
	kill_runner
	echo "Stopping"
	exit 1
}

function kill_runner() {
	# Kill cargo run
	# kill $(ps aux | grep 'cargo run' | awk ' {print $2}')
	kill $(ps aux | grep 'target/debug/backend' | awk ' {print $2}')
}

cargo build
cargo run &

while inotifywait -r -e close_write src/*; 
do
	build_run
done

