# mms

# Frontend

install npm

```
npm install -g gulp 
npm install 

gulp
```

# Backend

install rustlang

```
./autobuild.sh
``` 
debug

```
set RUST_BACKTRACE=1
```

# Nginx configuration

```
location / {
        try_files $uri /index.html; 
}

location /api/ {
        proxy_pass       http://localhost:4242/;

        proxy_http_version 1.1;
        proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header Connection "Keep-Alive";
        proxy_set_header Proxy-Connection "Keep-Alive";
}
```

# Postgresql Database
```
sudo -u postgres psql
CREATE USER mms;
CREATE DATABASE mms WITH OWNER mms;
\password mms
***
***
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