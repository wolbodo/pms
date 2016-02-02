# People Management System

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

Convenient autobuilder script that whatses /src for changes to do a debug build & run.
```
./autobuild.sh
``` 

More debugging:
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
```
```
CREATE USER pms;
CREATE DATABASE pms WITH OWNER pms;
\c pms;
CREATE EXTENSION pgcrypto;
\password pms
***
***
\q
```
```
sudo -u pms psql -f database/create.sql
sudo -u pms psql -f database/db-logic.sql
```

# Backup Cycle

Make a backup every 28 days.
```
sudo -u pms crontab -e
```
```
0 0 */28 * * pg_dump | bzip2 > backups/$(date +'%Y%m%dT%H%M%S%z').sql.bz2
```

Recovery of backups.
```
bzcat backups/YYYYmmddTHHMMSS+ZZZZ.sql.bz2 | sudo -u pms psql
```

# Api

## Login 
* POST /api/login                   ; create token
    - :username, :password
    - :token
    -> returns the current user.

## People
* GET  /api/people                  ; returns a list of all members
* POST /api/person                  ; creates a new member
* PUT  /api/person/:id              ; updates a member

## Fields
* GET  /api/fields                  ; returns all fields available for current user
* PUT  /api/fields                  ; updates fields