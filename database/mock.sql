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
    ('people', NULL, '{"required":["email","nickname"],"header":["nickname","firstname","lastname","city","gender","mobile","email"],"form":[{"title":"Persoon","fields":[["nickname"],["firstname","infix","lastname"],["gender"],["birthdate","deathdate"]]},{"title":"Adres","fields":[["street","housenumber"],["zipcode","city"],["country"]]},{"title":"Bank","fields":[["iban"],["directdebit"],["email"],["mobile"],["phone"],["emergencyinfo"]]},{"title":"Status","fields":[["membertype"],["membersince","membertill"],["functions"],["notes"],["wantscontact"]]},{"title":"Sleutel","fields":[["keycode"],["coasters"],["cashregister"],["frontdoor"],["isadmin"]]},{"title":"System","fields":[["passwordhash"],["modified"],["created"]]}]}', -1),
    ('people','gid', '{}', -1),
    ('people','id', '{}', -1),

    ('people','birthdate','{"type":"date","title":"Geboortedatum"}', -1),
    ('people','boardnotes', '{}', -1),
    ('people','cashregister','{"type":"boolean","title":"Kassasysteem"}', -1),
    ('people','city','{"type":"string","title":"Woonplaats"}', -1),
    ('people','coasters','{"type":"boolean","title":"Viltjes"}', -1),
    ('people','country','{"type":"string","title":"Land"}', -1),
    ('people','created','{"type":"string","title":"Aangemaakt"}', -1),
    ('people','deathdate','{"type":"date","title":"Sterfdatum"}', -1),
    ('people','directdebit','{"type":"array","title":"Overboeking"}', -1),
    ('people','email', '{"title":"Email","type":"string","validate":{"pattern":"/^.*@.*$/"}}', -1),
    ('people','emergencyinfo','{"type":"string","title":"Noodgeval info"}', -1),
    ('people','favoritenumber', '{}', -1),
    ('people','firstname','{"type":"string","title":"Voornaam"}', -1),
    ('people','frontdoor','{"type":"boolean","title":"Voordeur"}', -1),
    ('people','functions','{"type":"array","title":"Functies"}', -1),
    ('people','gender','{"type":"enum","title":"Geslacht","options":{"male":"Man","female":"Vrouw","trans":"Trans","other":"Anders"}}', -1),
    ('people','housenumber','{"type":"string","title":"Huisnummer"}', -1),
    ('people','iban','{"type":"string","title":"IBAN"}', -1),
    ('people','infix','{"type":"string","title":"Tussenvoegsel"}', -1),
    ('people','isadmin','{"type":"boolean","title":"Admin"}', -1),
    ('people','keycode','{"type":"string","title":"KeyCode"}', -1),
    ('people','lastname','{"type":"string","title":"Achternaam"}', -1),
    ('people','membersince','{"type":"string","title":"Lid sinds"}', -1),
    ('people','membertill','{"type":"string","title":"Lid tot"}', -1),
    ('people','membertype','{"type":"string","title":"Lid type"}', -1),
    ('people','mobile','{"type":"string","title":"Mobiel"}', -1),
    ('people','modified','{"type":"string","title":"Gewijzigd"}', -1),
    ('people','modified_by', '{}', -1),
    ('people','nickname','{"type":"string","title":"Bijnaam"}', -1),
    ('people','notes','{"type":"string","title":"Opmerkingen"}', -1),
    ('people','password_hash','{"type":"string","title":"Wachtwoord"}', -1),
    ('people','peoplesince', '{}', -1),
    ('people','phone','{"type":"string","title":"Telefoon"}', -1),
    ('people','privatenotes', '{}', -1),
    ('people','state', '{}', -1),
    ('people','street','{"type":"string","title":"Straat"}', -1),
    ('people','valid_from', '{}', -1),
    ('people','valid_till', '{}', -1),
    ('people','wantscontact','{"type":"boolean","title":"Wil contact"}', -1),
    ('people','zipcode','{"type":"string","title":"Postcode"}', -1),

    ('roles', NULL, '{"title":"Wijzig groep","header":["name","description"],"form":[{"title":"Gegevens","fields":[["name"],["description"]]}]}', -1),
    ('roles','gid', '{}', -1),
    ('roles','id', '{}', -1),

    ('roles','created', '{}', -1),
    ('roles','description', '{"type":"string","title":"Omschrijving"}', -1),
    ('roles','members', '{}', -1),
    ('roles','modified', '{}', -1),
    ('roles','modified_by', '{}', -1),
    ('roles','name', '{"type":"string","title":"Naam"}', -1),
    ('roles','valid_from', '{}', -1),
    ('roles','valid_till', '{}', -1),

    ('people_roles','name', '{"type":"string","title":"Naam"}', -1),
    ('people_roles','gid', '{}', -1),
    ('people_roles','id', '{}', -1),

    ('people_roles','$ref', '{}', -1),
    ('people_roles','created', '{}', -1),
    ('people_roles','modified', '{}', -1),
    ('people_roles','modified_by', '{}', -1),
    ('people_roles','valid_from', '{}', -1),
    ('people_roles','valid_till', '{}', -1),

    ('fields', NULL, '{"title":"Wijzig veld","form":[{"title":"Veld","fields":[["name"],["title"],["type"]]}]}', -1),
    ('fields', 'name', '{"name":"name","title":"Naam","type":"string","readonly":true}', -1),
    ('fields', 'type', '{"name":"type","title":"Type","type":"option","options":{"string":"Tekst","option":"Optie","enum":"Dropdown","date":"Datum","array":"Lijst","boolean":"Booleaan","link":"Link"}}', -1),
    ('fields', 'title', '{"name":"title","title":"Label","type":"string"}', -1),
    ('fields', 'target', '{"name":"target","title":"Doel","type":"string"}', -1),
    ('fields', 'displayValue', '{"name":"displayValue","title":"Weergegeven veld","type":"string"}', -1),
    ('fields', 'options', '{"name":"options","title":"Opties","type":"array"}', -1);


INSERT INTO permissions (type, ref_table, ref_key, ref_value, modified_by)
SELECT unnest(array['view','edit'])::permissions_type AS type, ref_table, 'fields' AS ref_key, id AS ref_value, -1 AS modified_by FROM fields WHERE ref_table IN ('people', 'roles', 'people_roles') UNION
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
        (array['view'],         array['member'],       array['gid','id','valid_from','valid_till','modified_by','modified','created', '$ref']),
        (array['view'],         array['login'],        array['name', 'members']),
        (array['view'],         array['member'],       array['email','phone','mobile','nickname','firstname','infix','lastname','street','housenumber','zipcode','city','state','country','functions','emergencyinfo','membertype','peoplesince','favoritenumber','notes']),
        (array['view','edit'],  array['self'],         array['favoritenumber','privatenotes','coasters']),
        (array['edit'],         array['self','admin'], array['password_hash']),
        -- role permissions
        (array['edit'],         array['board'],        array['name', 'description']),
        (array['view'],         array['member'],       array['name', 'description']),
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
