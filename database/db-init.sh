#!/bin/bash
sudo -u postgres psql -c 'CREATE USER pms;'
sudo -u postgres psql -c 'CREATE DATABASE pms WITH OWNER pms;'
sudo -u postgres psql -d pms -c 'CREATE EXTENSION pgcrypto;'


psql -d pms -U pms -f /app/database/create.sql
sed "s/:'token_sha256_key'/'$(openssl rand -hex 64)'/g" /app/database/db-logic.sql | psql -U pms -d pms -X
psql -d pms -U pms -f /app/database/mock.sql



