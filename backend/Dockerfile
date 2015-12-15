#
# Node.js w/ Bower & Gulp runtime Dockerfile
#
# https://github.com/dockerfile/nodejs-bower-gulp-runtime
#
FROM jimmycuadra/rust

WORKDIR /app

COPY . .

RUN cargo build


# Define default command.
# Setup server
CMD ["cargo", "run"]
