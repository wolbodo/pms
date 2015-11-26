BEGIN;

CREATE OR REPLACE FUNCTION update_timestamp() RETURNS trigger AS
$$ BEGIN NEW.modified = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP SEQUENCE IF EXISTS "gid_seq" CASCADE;
CREATE SEQUENCE "gid_seq" INCREMENT 1 MINVALUE 1 START 1 CACHE 1;


DROP TABLE IF EXISTS "members" CASCADE;
CREATE TABLE "members"
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
CREATE TRIGGER "members_modified" BEFORE UPDATE ON "members" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "groups" CASCADE;
CREATE TABLE "groups"
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
CREATE TRIGGER "groups_modified" BEFORE UPDATE ON "groups" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TABLE IF EXISTS "members_groups" CASCADE;
CREATE TABLE "members_groups"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "members_id"        INT NOT NULL,
    "groups_id"          INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "members_groups_modified" BEFORE UPDATE ON "members_roles" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

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

DROP TYPE IF EXISTS "permissions_type";
CREATE TYPE "permissions_type" AS ENUM ('read', 'write', 'grant');

DROP TABLE IF EXISTS "permissions" CASCADE;
CREATE TABLE "permissions"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "id"                SERIAL,
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "name"              VARCHAR(255) NOT NULL,
    "type"              permissions_type NOT NULL DEFAULT 'read',
    "ref_type"          VARCHAR(255) NOT NULL,
    "ref_id"            INT NOT NULL,
    "data"              JSONB NOT NULL DEFAULT '{}',
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "permissions_modified" BEFORE UPDATE ON "permissions" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();


DROP TABLE IF EXISTS "groups_permissions" CASCADE;
CREATE TABLE "groups_permissions"
(
    "gid"               INT NOT NULL DEFAULT NEXTVAL('"gid_seq"'),
    "valid_from"        TIMESTAMPTZ DEFAULT NOW() NOT NULL CHECK ("valid_from" < "valid_till"),
    "valid_till"        TIMESTAMPTZ,
    "groups_id"         INT NOT NULL,
    "permissions_id"    INT NOT NULL,
    "modified_by"       INT NOT NULL,
    "modified"          TIMESTAMPTZ, -- this should always be NULL if we don't do manual SQL
    "created"           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER "groups_permissions_modified" BEFORE UPDATE ON "groups_permissions" FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

--FIXME: PLEASE ADD INDEXING AND PRIMARY KEYS ;)

COMMIT;