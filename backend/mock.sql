BEGIN;

-- "WOLBODOISAWESOME, itmysupersecretpassword"
INSERT INTO members (email, phone, password_hash, data, modified_by) VALUES (
'piet@pietersen.pt', '01234123123', '$2b$12$gjythVOXppwtIIs30n26JuNh.X/KJoJllRLhR0xLAsYjOgZRQjDnm', '{"nickname": "Piet Jan", "firstname": "Pietje", "infix": "van", "lastname": "Pietersen", "street": "Pietjanstraat", "housenumber": "2", "zipcode": "1234ab", "city": "Delft", "country": "Nieuw Amsterdam", "gender": "male", "mobile": "01234123123", "phone": "0123123123", "iban": "NL12NOBANK123123123123", "birthdate": "2015-10-10", "deathdate": "2014-10-10", "emergencyinfo": "Niet reanimeren?", "membertype": "member", "membersince": "2014-10-10", "functions": "eettafel, bestuur", "notes": "", "wantscontact": "yes", "keycode": "123123", "coasters": "true", "cashregister": "true", "frontdoor": "false", "directdebit": "contribution"}', -1 
);
  
COMMIT;