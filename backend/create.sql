BEGIN;

CREATE OR REPLACE FUNCTION update_timestamp() RETURNS trigger AS
$$ BEGIN NEW.modified = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TABLE IF EXISTS "members" CASCADE;
CREATE TABLE "members"
(
    "gid"               SERIAL,
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "email"             VARCHAR(255),
    "phone"             VARCHAR(255),
    "password_hash"     VARCHAR(255),
    "data"              JSONB,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "members_modified" BEFORE UPDATE ON "members" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE "roles"
(
    "gid"               SERIAL,
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "name"              VARCHAR(255) NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "roles_modified" BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "members_roles" CASCADE;
CREATE TABLE "members_roles"
(
    "gid"               SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "members_id"        INT NOT NULL,
    "roles_id"          INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "members_roles_modified" BEFORE UPDATE ON "members_roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "fields" CASCADE;
CREATE TABLE "fields"
(
    "gid"               SERIAL,
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "name"              VARCHAR(255) NOT NULL,
    "data"              JSONB,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "fields_modified" BEFORE UPDATE ON "fields" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "fields_roles" CASCADE;
CREATE TABLE "fields_roles"
(
    "gid"               SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "read"              BOOLEAN DEFAULT TRUE,
    "write"             BOOLEAN DEFAULT FALSE,
    "fields_id"         INT NOT NULL,
    "roles_id"          INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "fields_roles_modified" BEFORE UPDATE ON "fields_roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

--FIXME: PLEASE ADD INDEXING

COMMIT;