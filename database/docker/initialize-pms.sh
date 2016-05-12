#!/bin/bash
#!/bin/bash
set -e

# sed '/# TYPE/i local   pms    pms   trust' /etc/postgresql/9.5/main/pg_hba.conf > /etc/postgresql/9.5/main/pg_hba.conf

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
	CREATE EXTENSION pgcrypto;
EOSQL

psql -d pms -U pms -f /app/database/create.sql
sed "s/:'token_sha256_key'/'$(openssl rand -hex 64)'/g" /app/database/db-logic.sql | psql -U pms -d pms -X
psql -d pms -U pms -f /app/database/mock.sql

