# People Management System
=======


# Fully dynamic frontend configuration and state management.
![Drag and drop functionality demoed](https://raw.githubusercontent.com/wolbodo/pms/master/drag.gif)


# Authentication and access control in database layer. 
Thats why there's a minimal backend.

```sql
SELECT people_get(login('sammy@example.com', '1234'), 2);
```

returns

```json
{
    "id": 2,
    "gid": 586,
    "city": "Delft",
    "iban": "NL12NOBANK123123123132",
    "email": "wikkert@example.com",
    "notes": "Al 60 jaar stand-bye!",
    "phone": "+31600000001",
    "gender": "trans",
    "mobile": "+31600000001",
    "street": "Verwersdijk",
    "country": "The Netherlands",
    "created": 1455006259,
    "zipcode": "2611NK",
    "lastname": "Anonymous",
    "modified": null,
    "nickname": "Wikkert",
    "functions": [
        "boardmember",
        "eettafel"
    ],
    "membertype": "member",
    "valid_from": 1455006259,
    "valid_till": null,
    "directdebit": [
        "contribution"
    ],
    "housenumber": "104",
    "modified_by": 3,
    "peoplesince": "2010-01-01",
    "emergencyinfo": "Niet reanimeren!",
    "favoritenumber": 42
}
```


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

<!--NOTE: psql variables don't work in CREATE FUNCTIONS?: sudo -u pms psql -f database/db-logic.sql -v "token_sha256_key=$(openssl rand -hex 64)"-->
```
sudo -u pms psql -f database/create.sql
sed "s/:'token_sha256_key'/'$(openssl rand -hex 64)'/g" database/db-logic.sql | sudo -u pms psql
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
* GET  /api/people                  ; returns a list of all people
* GET  /api/people/:id              ; returns a person
* POST /api/people                  ; creates a new person
* PUT  /api/people/:id              ; updates a person

## Fields
* GET  /api/fields                  ; returns all fields available for current user
* PUT  /api/fields                  ; updates fields
