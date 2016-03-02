BEGIN;



-- INSERT INTO people (email, password_hash, modified_by) SELECT 'test@example.com', crypt('1234',gen_salt('bf',13)), -1;

-- "WOLBODOISAWESOME, itmysupersecretpassword"
INSERT INTO people (email, phone, password_hash, modified_by, data) VALUES
('admin@example.com', '+31152121516', crypt('1234',gen_salt('bf',13)), -1, '{}'),
('wikkert@example.com', '+31152121516', crypt('1234',gen_salt('bf',13)), -1,
    '{
         "nickname": "Wikkert",
         "firstname": "Willem",
         "infix": "van",
         "lastname": "Olbodo",
         "street": "Verwersdijk",
         "housenumber": "102",
         "zipcode": "2611NK",
         "city": "Delft",
         "country": "The Netherlands",
         "gender": "male",
         "mobile": "+31600000001",
         "iban": "NL12NOBANK123123123123",
         "birthdate": "1939-04-14",
         "deathdate": "2029-04-14",
         "emergencyinfo": "Niet reanimeren!",
         "membertype": "member",
         "peoplesince": "1959-04-14",
         "functions": ["commissieX"],
         "notes": "Al 60 jaar stand-bye!",
         "favoritenumber": 42,
         "wantscontact": "yes",
         "keycode": "123123",
         "coasters": { "authentication": ["pincode","key","fingerprint"], "balancetopup": 20.00 },
         "cashregister": true,
         "frontdoor": {"timelimits":[{"from":"16:00", "to":"02:00", "days":["monday","thursday"]}]},
         "directdebit": ["contribution", "coasters"]
    }'
),
('sammy@example.com', '+31600000001', crypt('1234',gen_salt('bf',13)), -1,
    '{
         "nickname": "Sammy",
         "firstname": "Sam",
         "lastname": "Anonymous",
         "street": "Verwersdijk",
         "housenumber": "104",
         "zipcode": "2611NK",
         "city": "Delft",
         "country": "The Netherlands",
         "gender": "trans",
         "iban": "NL12NOBANK123123123132",
         "birthdate": "1989-04-14",
         "peoplesince": "2010-01-01",
         "functions": ["boardmember", "eettafel"],
         "keycode": "321321",
         "coasters": null,
         "cashregister": true,
         "frontdoor": true,
         "directdebit": ["contribution"]
    }'
),
('keymaster@example.com', '+31152121516', crypt('1234',gen_salt('bf',13)), -1, '{}'),
('aivd@example.com', '+31793205050', crypt('1234',gen_salt('bf',13)), -1, '{}');

INSERT INTO roles (name, modified_by)
VALUES
    ('login', -1),
    ('self', -1),
    ('admin', -1),
    ('board', -1),
    ('member', -1),
    ('solvable', -1),
    ('oldmember', -1),
    ('keymanager', -1),
    ('keyobserver', -1);

INSERT INTO people_roles (people_id, roles_id, modified_by)
SELECT people.id, roles.id, -1 FROM
    (VALUES
        ('admin@example.com', array['login','admin']),
        ('wikkert@example.com', array['login','member']),
        ('sammy@example.com', array['login','member','board','solvable']),
        ('keymaster@example.com', array['login','keymanager']),
        ('aivd@example.com', array['login','keyobserver'])
    ) alias (people_email, roles_names)
    JOIN people ON people.valid_till IS NULL AND people.email = alias.people_email
    JOIN roles ON roles.valid_till IS NULL AND roles.name IN (SELECT unnest(alias.roles_names));

INSERT INTO fields (ref_table, name, data, modified_by)
VALUES
    ('people','gid', '{}', -1),
    ('people','id', '{}', -1),
    ('people','valid_from', '{}', -1),
    ('people','valid_till', '{}', -1),
    ('people','email', '{}', -1),
    ('people','phone', '{}', -1),
    ('people','password_hash', '{}', -1),
    ('people','modified_by', '{}', -1),
    ('people','modified', '{}', -1),
    ('people','created', '{}', -1),
    ('people','nickname', '{}', -1),
    ('people','firstname', '{}', -1),
    ('people','infix', '{}', -1),
    ('people','lastname', '{}', -1),
    ('people','street', '{}', -1),
    ('people','housenumber', '{}', -1),
    ('people','zipcode', '{}', -1),
    ('people','city', '{}', -1),
    ('people','state', '{}', -1),
    ('people','country', '{}', -1),
    ('people','gender', '{}', -1),
    ('people','mobile', '{}', -1),
    ('people','phone', '{}', -1),
    ('people','iban', '{}', -1),
    ('people','birthdate', '{}', -1),
    ('people','deathdate', '{}', -1),
    ('people','emergencyinfo', '{}', -1),
    ('people','membertype', '{}', -1),
    ('people','peoplesince', '{}', -1),
    ('people','functions', '{}', -1),
    ('people','notes', '{}', -1),
    ('people','boardnotes', '{}', -1),
    ('people','privatenotes', '{}', -1),
    ('people','favoritenumber', '{}', -1),
    ('people','wantscontact', '{}', -1),
    ('people','keycode', '{}', -1),
    ('people','coasters', '{}', -1),
    ('people','cashregister', '{}', -1),
    ('people','frontdoor', '{}', -1),
    ('people','directdebit', '{}', -1),
    ('roles','gid', '{}', -1),
    ('roles','id', '{}', -1),
    ('roles','name', '{}', -1),
    ('roles','people_ids', '{}', -1),
    ('roles','valid_from', '{}', -1),
    ('roles','valid_till', '{}', -1);

INSERT INTO permissions (type, ref_table, ref_key, ref_value, modified_by)
SELECT unnest(array['view','edit'])::permissions_type AS type, ref_table, 'fields' AS ref_key, id AS ref_value, -1 AS modified_by FROM fields WHERE ref_table IN ('people', 'roles') UNION
SELECT 'create' AS type, 'people_roles' AS ref_table, 'roles_id' AS ref_key, id AS ref_value, -1 AS modified_by FROM roles UNION
SELECT 'create' AS type, unnest(array['people','roles','people_roles','fields','permissions']) AS ref_table, NULL AS ref_key, NULL AS ref_value, -1 AS modified_by UNION
VALUES ('custom'::permissions_type, 'website', 'createPosts', NULL::INT, -1),
       ('custom'::permissions_type, 'website', 'createEvents', NULL::INT, -1),
       ('custom'::permissions_type, 'website', 'maxValueForSomething', 5, -1),
       ('custom'::permissions_type, 'website', 'editTemplateIds', 2100, -1),
       ('custom'::permissions_type, 'website', 'editTemplateIds', 2500, -1),
       ('custom'::permissions_type, 'website', 'viewLogs', NULL, -1),
       ('create'::permissions_type, 'people_roles', 'roles_id', NULL, -1) UNION
SELECT 'create'::permissions_type, 'people_roles', 'roles_id', id, -1 FROM roles WHERE name IN ('board','member','keymanager','keyobserver','admin');

INSERT INTO roles_permissions (roles_id, permissions_id, modified_by)
SELECT DISTINCT roles.id, permissions.id, -1 FROM
    (VALUES
        (array['view'],         array['member'],       array['gid','id','valid_from','valid_till','modified_by','modified','created']),
        (array['view'],         array['login'],        array['name', 'people_ids']),
        (array['view'],         array['member'],       array['email','phone','mobile','nickname','firstname','infix','lastname','street','housenumber','zipcode','city','state','country','functions','emergencyinfo','membertype','peoplesince','favoritenumber','notes']),
        (array['view','edit'],  array['self'],         array['favoritenumber','privatenotes','coasters']),
        (array['edit'],         array['self','admin'], array['password_hash']),
        (array['view', 'edit'], array['self','board'], array['email','phone','mobile','street','housenumber','zipcode','city','state','country','iban','directdebit','gender','emergencyinfo','notes']),
        (array['view', 'edit'], array['board'],        array['nickname','firstname','infix','lastname','birthdate','deathdate','boardnotes','functions','membertype','peoplesince','frontdoor','cashregister']),
        (array['view', 'edit'], array['keymanager'],   array['keycode','frontdoor','cashregister']),
        (array['view'],         array['keyobserver'],  array['keycode','frontdoor','cashregister'])
    ) alias (types, roles_names, fields_names)
    JOIN roles ON roles.valid_till IS NULL AND roles.name IN (SELECT unnest(alias.roles_names))
    JOIN fields ON fields.valid_till IS NULL AND fields.name IN (SELECT unnest(alias.fields_names))
    JOIN permissions ON
        permissions.valid_till IS NULL
        AND permissions.type::TEXT IN (SELECT unnest(alias.types))
        AND permissions.ref_table = fields.ref_table
        AND permissions.ref_key = 'fields'
        AND permissions.ref_value = fields.id
    UNION
SELECT DISTINCT roles.id, permissions.id, -1 FROM
    (VALUES
        (array['create'],        array['board'],        array['people','roles'])
    ) alias (types, roles_names, table_names)
    JOIN roles ON roles.valid_till IS NULL AND roles.name IN (SELECT unnest(alias.roles_names))
    JOIN permissions ON
        permissions.valid_till IS NULL
        AND permissions.type::TEXT IN (SELECT unnest(alias.types))
        AND permissions.ref_table IN (SELECT unnest(alias.table_names))
        AND permissions.ref_key IS NULL
        AND permissions.ref_value IS NULL
    UNION
SELECT roles.id, permissions.id, -1 FROM roles, permissions WHERE roles.name = 'board' AND ref_table = 'people_roles' AND ref_value IN (SELECT id FROM roles WHERE name IN ('board','member','keymanager','keyobserver'))
    UNION
SELECT roles.id, permissions.id, -1 FROM roles, permissions WHERE roles.name = 'admin' AND ref_table = 'people_roles' AND (ref_value IN (SELECT id FROM roles WHERE name IN ('board','admin')) OR ref_value IS NULL)
    UNION
SELECT roles.id, permissions.id, -1 FROM roles, permissions WHERE roles.name = 'board' AND ref_table = 'website';

COMMIT;
