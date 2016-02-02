#!/bin/bash


sudo -u postgres psql -c 'CREATE USER pms;'
sudo -u postgres psql -c 'CREATE DATABASE pms WITH OWNER pms;'
sudo -u postgres psql -d pms -c 'CREATE EXTENSION pgcrypto;'

psql -d pms -U pms -f /app/database/create.sql
psql -d pms -U pms -f /app/database/create.sql
psql -d pms -U pms -f /app/database/db-logic.sql
psql -d pms -U pms -f /app/database/db-logic.sql
psql -d pms -U pms -f /app/database/mock.sql



