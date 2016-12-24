BEGIN;

-- NOTE: Cannot execute CREATE EXTENSION without superuser privileges.
-- CREATE EXTENSION pgcrypto;

-- NOTE: "REFERENCES ref_table_ (id)" cannot be used since id is not UNIQUE (it's unique with "WHERE valid_till IS NULL").
-- NOTE: modified & created are not exposed to the API, they come in handy if you ever manually write SQL (e.g. data migrations), trust me on this one --bwb.

-- FIXME: access control, namely users, schemas, databases and (column) permissions:
--        Change owner to PMS, remove DROP? remove UPDATE of modified & created (otherwise it defeats the purpose).
--        Make pmsapi group/user, give only INSERT and UPDATE column valid_till rights.
--        Make pmsmaild user, since NOTIFY's are DB specific, we can create a seperate DB just for this + 2 exposed functions, e.g. fetch(X) + update(X, data).


CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN NEW.modified = NOW(); RETURN NEW; END; $function$;


DROP SEQUENCE IF EXISTS gid_seq CASCADE;
CREATE SEQUENCE gid_seq INCREMENT 1 MINVALUE 1 START 1 CACHE 1;

--NOTE: email uses a very lazy email & FQN checking, but it's better to do it lazy than plain wrong (e.g. not supporting xn-- tld's etc.).
DROP TABLE IF EXISTS people CASCADE;
CREATE TABLE people
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    id                SERIAL,
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    email             VARCHAR(255) CONSTRAINT is_email CHECK (email ~ '^[^@]+@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+(xn--[a-zA-Z0-9-]{4,}|[a-zA-Z]{2,})$'),
    phone             VARCHAR(255),
    password_hash     VARCHAR(255),
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER people_modified BEFORE UPDATE ON people FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE UNIQUE INDEX ON people (id) WHERE valid_till IS NULL;
CREATE UNIQUE INDEX ON people (email) WHERE valid_till IS NULL;
CREATE UNIQUE INDEX ON people ((data->>'nickname')) WHERE valid_till IS NULL;

DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    id                SERIAL,
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    name              VARCHAR(255) NOT NULL,
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER roles_modified BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE UNIQUE INDEX ON roles (id) WHERE valid_till IS NULL;
CREATE UNIQUE INDEX ON roles (name) WHERE valid_till IS NULL;

DROP TABLE IF EXISTS people_roles CASCADE;
CREATE TABLE people_roles
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    people_id         INT NOT NULL,
    roles_id          INT NOT NULL,
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER people_roles_modified BEFORE UPDATE ON people_roles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE UNIQUE INDEX ON people_roles (people_id, roles_id) WHERE valid_till IS NULL;

DROP TABLE IF EXISTS fields CASCADE;
CREATE TABLE fields
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    id                SERIAL,
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    ref_table         VARCHAR(255) NOT NULL,
    name              VARCHAR(255),
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER fields_modified BEFORE UPDATE ON fields FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- NOTE: Only one active meta field (name IS NULL) is allowed per table, and one active name per table.
CREATE UNIQUE INDEX ON fields (id) WHERE valid_till IS NULL;
CREATE UNIQUE INDEX ON fields (ref_table) WHERE valid_till IS NULL AND name IS NULL;
CREATE UNIQUE INDEX ON fields (ref_table, name) WHERE valid_till IS NULL;

DROP TABLE IF EXISTS permissions CASCADE;
DROP TYPE IF EXISTS permissions_type CASCADE;
CREATE TYPE permissions_type AS ENUM ('view', 'edit', 'create', 'custom');

CREATE TABLE permissions
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    id                SERIAL,
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    ref_table         VARCHAR(255) NOT NULL,
    ref_key           VARCHAR(255),
    ref_value         INT,
    type              permissions_type NOT NULL DEFAULT 'view',
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER permissions_modified BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE UNIQUE INDEX ON permissions (id) WHERE valid_till IS NULL;
CREATE UNIQUE INDEX ON permissions (ref_table, type, ref_key, ref_value) WHERE valid_till IS NULL;

DROP TABLE IF EXISTS roles_permissions CASCADE;
CREATE TABLE roles_permissions
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    valid_from        TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT is_chronological CHECK (valid_from < valid_till),
    valid_till        TIMESTAMPTZ,
    roles_id          INT NOT NULL,
    permissions_id    INT NOT NULL,
    data              JSONB NOT NULL DEFAULT '{}',
    modified_by       INT NOT NULL,
    modified          TIMESTAMPTZ,
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
WITH (
    OIDS=FALSE
);
CREATE TRIGGER roles_permissions_modified BEFORE UPDATE ON roles_permissions FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE UNIQUE INDEX ON roles_permissions (roles_id, permissions_id) WHERE valid_till IS NULL;


-- Create the email queue database.

-- Usecases:
-- send notification emails
-- to: user
-- store user gid
-- store state for email processing
-- 

DROP TABLE IF EXISTS email_queue CASCADE;
CREATE TABLE email_queue
(
    gid               INT NOT NULL DEFAULT NEXTVAL('gid_seq'),
    data              JSONB NOT NULL DEFAULT '{}',
    state             VARCHAR(255) default 'pending',
    created           TIMESTAMPTZ DEFAULT NOW() NOT NULL

)


COMMIT;