#!/bin/sh

while inotifywait -r -e close_write src/*; 
do   cargo build && run; 
done