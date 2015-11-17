BEGIN;

-- "WOLBODOISAWESOME, itmysupersecretpassword"
INSERT INTO members (email, phone, password_hash, modified_by, data) VALUES
('admin@example.com', '+31152121516', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', -1, NULL),
('wikkert@example.com', '+31152121516', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', -1,
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
         "membersince": "1959-04-14",
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
('sammy@example.com', '+31600000001', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', -1,
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
         "membersince": "2010-01-01",
         "functions": ["boardmember", "eettafel"],
         "keycode": "321321",
         "coasters": null,
         "cashregister": true,
         "frontdoor": true,
         "directdebit": ["contribution"]
    }'
),
('keymaster@example.com', '+31152121516', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', -1, NULL),
('aivd@example.com', '+31793205050', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', -1, NULL);

INSERT INTO roles (name, modified_by)
VALUES
    ('login', -1),
    ('self', -1),
    ('admin', -1),
    ('board', -1),
    ('member', -1),
    ('oldmember', -1),
    ('keymanager', -1),
    ('keyobserver', -1);

INSERT INTO members_roles (members_id, roles_id, modified_by)
SELECT members.id, roles.id, -1 FROM
    (VALUES
        ('admin@example.com', array['login','admin']),
        ('wikkert@example.com', array['login','member']),
        ('sammy@example.com', array['login','member','board']),
        ('keymaster@example.com', array['login','keymanager']),
        ('aivd@example.com', array['login','keyobserver'])
    ) alias (membersemail, rolesnames)
    JOIN members ON members.valid_till IS NULL AND members.email = alias.membersemail
    JOIN roles ON roles.valid_till IS NULL AND roles.name IN (SELECT unnest(alias.rolesnames));

INSERT INTO fields (name, data, modified_by)
VALUES
    ('gid', NULL, -1),
    ('id', NULL, -1),
    ('valid_from', NULL, -1),
    ('valid_till', NULL, -1),
    ('email', NULL, -1),
    ('phone', NULL, -1),
    ('password_hash', NULL, -1),
    ('modified_by', NULL, -1),
    ('modified', NULL, -1),
    ('created', NULL, -1),
    ('nickname', NULL, -1),
    ('firstname', NULL, -1),
    ('infix', NULL, -1),
    ('lastname', NULL, -1),
    ('street', NULL, -1),
    ('housenumber', NULL, -1),
    ('zipcode', NULL, -1),
    ('city', NULL, -1),
    ('state', NULL, -1),
    ('country', NULL, -1),
    ('gender', NULL, -1),
    ('mobile', NULL, -1),
    ('phone', NULL, -1),
    ('iban', NULL, -1),
    ('birthdate', NULL, -1),
    ('deathdate', NULL, -1),
    ('emergencyinfo', NULL, -1),
    ('membertype', NULL, -1),
    ('membersince', NULL, -1),
    ('functions', NULL, -1),
    ('notes', NULL, -1),
    ('boardnotes', NULL, -1),
    ('privatenotes', NULL, -1),
    ('favoritenumber', NULL, -1),
    ('wantscontact', NULL, -1),
    ('keycode', NULL, -1),
    ('coasters', NULL, -1),
    ('cashregister', NULL, -1),
    ('frontdoor', NULL, -1),
    ('directdebit', NULL, -1);

INSERT INTO fields_roles (read, write, fields_id, roles_id, modified_by)
SELECT read, write, fields.id, roles.id, -1 FROM
    (VALUES
        (TRUE, FALSE, array['email','phone','mobile','nickname','firstname','infix','lastname','street','housenumber','zipcode','city','state','country','functions','emergencyinfo','membertype','membersince','favoritenumber','notes'], array['member']),
        (TRUE, FALSE, array['gid','id','valid_from','valid_till','modified_by','modified','created'], array['self']),
        (TRUE, TRUE, array['favoritenumber','privatenotes','coasters'], array['self']),
        (FALSE, TRUE, array['password_hash'], array['self','admin']),
        (TRUE, TRUE, array['email','phone','mobile','street','housenumber','zipcode','city','state','country','iban','directdebit','gender','emergencyinfo','notes'], array['self','board']),
        (TRUE, TRUE, array['nickname','firstname','infix','lastname','birthdate','deathdate','boardnotes','functions','membertype','membersince','frontdoor','cashregister'], array['board']),
        (TRUE, TRUE, array['keycode','frontdoor','cashregister'], array['keymanager']),
        (TRUE, FALSE, array['keycode','frontdoor','cashregister'], array['keyobserver'])
    ) alias (read, write, fieldsnames, rolesnames)
    JOIN fields ON fields.valid_till IS NULL AND fields.name IN (SELECT unnest(alias.fieldsnames))
    JOIN roles ON roles.valid_till IS NULL AND roles.name IN (SELECT unnest(alias.rolesnames));

COMMIT;
