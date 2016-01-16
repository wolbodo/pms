BEGIN;

CREATE EXTENSION pgcrypto;

CREATE OR REPLACE FUNCTION update_timestamp() RETURNS trigger AS
$$ BEGIN NEW.modified = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP SEQUENCE IF EXISTS "gid_seq" CASCADE;
CREATE SEQUENCE "gid_seq" INCREMENT 1 MINVALUE 1 START 1 CACHE 1;


DROP TABLE IF EXISTS "people" CASCADE;
CREATE TABLE "people"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "email"             VARCHAR(255),
    "phone"             VARCHAR(255),
    "password_hash"     VARCHAR(255),
    "data"              JSONB NOT NULL DEFAULT '{}',
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "people_modified" BEFORE UPDATE ON "people" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE "roles"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "name"              VARCHAR(255) NOT NULL,
    "data"              JSONB NOT NULL DEFAULT '{}',
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "roles_modified" BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "people_roles" CASCADE;
CREATE TABLE "people_roles"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "people_id"         INT NOT NULL,
    "roles_id"          INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "people_roles_modified" BEFORE UPDATE ON "people_roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "fields" CASCADE;
CREATE TABLE "fields"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "ref_type"          VARCHAR(255) NOT NULL,
    "name"              VARCHAR(255) NOT NULL,
    "data"              JSONB NOT NULL DEFAULT '{}',
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "fields_modified" BEFORE UPDATE ON "fields" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TYPE IF EXISTS "permissions_type" CASCADE;
CREATE TYPE "permissions_type" AS ENUM ('read', 'write', 'create', 'custom');

CREATE TABLE "permissions"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "ref_type"          VARCHAR(255) NOT NULL,
    "ref_key"           VARCHAR(255) NOT NULL,
    "ref_value"         INT,
    "type"              permissions_type NOT NULL DEFAULT 'read',
    "data"              JSONB NOT NULL DEFAULT '{}',
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "permissions_modified" BEFORE UPDATE ON "permissions" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();


DROP TABLE IF EXISTS "roles_permissions" CASCADE;
CREATE TABLE "roles_permissions"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "roles_id"          INT NOT NULL,
    "permissions_id"    INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "roles_permissions_modified" BEFORE UPDATE ON "roles_permissions" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

--FIXME: PLEASE ADD INDEXING AND PRIMARY KEYS ;)
--FIXME: change owner to PMS
--FIXME: make pmsuser group, give only INSERT and UPDATE column valid_till rights

COMMIT;