#
# Node.js w/ Bower & Gulp runtime Dockerfile
#
# https://github.com/dockerfile/nodejs-bower-gulp-runtime
#
FROM busybox

RUN mkdir /app
WORKDIR /app

COPY target/release/ .


# Define default command.
# Setup server
CMD ["./backend"]
