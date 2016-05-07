#!/bin/bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    CREATE USER pms;
    CREATE DATABASE pms WITH OWNER pms;
	\c pms;
	CREATE EXTENSION pgcrypto;
EOSQL

psql -d pms -U pms -f /app/database/create.sql
sed "s/:'token_sha256_key'/'$(openssl rand -hex 64)'/g" /app/database/db-logic.sql | psql -U pms -d pms -X
psql -d pms -U pms -f /app/database/mock.sql

