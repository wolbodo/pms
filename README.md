# pms

# Frontend setup

Install npm/node

Install dependencies
```
npm install
```

Start development server
```
npm start
```

Build production frontend
```
npm run build
```

# Backend

Install rust (we will later drop the nightly channel).
```
curl -sSf https://static.rust-lang.org/rustup.sh | sh -s -- --channel=nightly
```

Install libssl-dev or openssl-dev (for what again?)
```
sudo apt-get install -y libssl-dev
```

Install some extra dependencies for postgres_macros (sql! macro that syntax checks the SQL at build). Readline is definitly needed, bison and flex are optional.
```
sudo apt-get install -y libreadline-dev bison flex
```

```
./autobuild.sh
``` 
debug

```
set RUST_BACKTRACE=1
```

# Nginx configuration

```
location /api/ {
        proxy_pass       http://localhost:4242/;

        proxy_http_version 1.1;
        proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header Connection "Keep-Alive";
        proxy_set_header Proxy-Connection "Keep-Alive";
}

location / {
        try_files $uri /index.html; 
}

```

# Postgresql Database

Setup database, user, tables and functions.
```
sudo -u postgres psql
CREATE USER pms;
CREATE DATABASE pms WITH OWNER pms;
\c pms;
CREATE EXTENSION pgcrypto;
\password pms
***
***
\q
psql -u pms -d pms -f database/create.sql
psql -u pms -d pms -f database/db-logic.sql
```

# Api

## Login 
* POST /api/login                   ; create token
    - :username, :password 
    - :token
    -> returns the current user.

## Members
* GET  /api/members                 ; returns a list of all members.
* POST /api/member                  ; creates a new member
* PUT  /api/member/:memberid        ; updates a member

## Fields
* GET  /api/fields                  ; returns all fields available for current user.
* PUT  /api/fields                  ; updates fields 