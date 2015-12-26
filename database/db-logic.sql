--Select all people with the fields for member id XXX
CREATE OR REPLACE FUNCTION getpermissions(permissions_type, varchar, int, int DEFAULT -1) RETURNS TABLE(key varchar, self_id int) AS $$
DECLARE
    _type ALIAS FOR $1;
    _ref_type ALIAS FOR $2;
    _self_id ALIAS FOR $3;
    _people_id ALIAS FOR $4;
BEGIN
  RETURN QUERY (SELECT DISTINCT fields.name AS key, CASE WHEN groups.name = 'self' THEN people.id END AS self_id
     FROM
        fields JOIN permissions ON  permissions.ref_key = 'field' AND permissions.ref_value = fields.id AND permissions.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN groups_permissions ON permissions.id = groups_permissions.permissions_id AND groups_permissions.valid_till IS NULL
               JOIN groups ON groups.id = groups_permissions.groups_id AND groups.valid_till IS NULL
               JOIN people_groups ON (people_groups.groups_id = groups.id OR groups.name = 'self') AND people_groups.valid_till IS NULL
               JOIN people ON people_groups.people_id = people.id AND people.id = _self_id AND (groups.name != 'self' OR _people_id = -1 OR _people_id = _self_id) AND people.valid_till IS NULL
      WHERE permissions.type = _type AND permissions.ref_type = _ref_type);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION getpeople(int, int DEFAULT -1) RETURNS TABLE(json jsonb) AS $$
DECLARE
    _self_id ALIAS FOR $1;
    _people_id ALIAS FOR $2;
BEGIN
  RETURN QUERY (
      WITH readfields AS (SELECT * FROM getpermissions('read'::permissions_type, 'people', _self_id))
      SELECT ('{' || (
          SELECT STRING_AGG('"' || key || '":' || TO_JSON(value), ',')
          FROM (SELECT * FROM JSONB_EACH(data) UNION
              VALUES
                  ('gid'::TEXT, TO_JSON(gid)::JSONB),
                  ('id', TO_JSON(id)::JSONB),
                  ('valid_from', TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_from)))::JSONB),
                  ('valid_till', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_till)))::JSONB, 'null'::JSONB)),
                  ('email', COALESCE(TO_JSON(email)::JSONB, 'null'::JSONB)),
                  ('phone', COALESCE(TO_JSON(phone)::JSONB, 'null'::JSONB)),
                  ('password_hash', COALESCE(TO_JSON(password_hash)::JSONB, 'null'::JSONB)),
                  ('modified_by', TO_JSON(modified_by)::JSONB),
                  ('modified', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM modified)))::JSONB, 'null'::JSONB)),
                  ('created', TO_JSON(FLOOR(EXTRACT(EPOCH FROM created)))::JSONB)
              ) alias
              WHERE key IN (SELECT key FROM readfields WHERE self_id IS NULL OR people.id = $1))  || '}')::JSONB
          FROM people WHERE valid_till IS NULL AND (people.id = _people_id OR -1 = _people_id)
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION exception(text) RETURNS varchar LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION '%', $1; RETURN ''; END; $$;

--FIXME LATER: Dexter case (update people as same people)
CREATE OR REPLACE FUNCTION setperson(int, int, jsonb) RETURNS TABLE(json jsonb) AS $$
DECLARE
    _self_id ALIAS FOR $1;
    _people_id ALIAS FOR $2;
    _data ALIAS FOR $3;
BEGIN
    UPDATE people SET valid_till = NOW() WHERE id = $2 AND valid_till IS NULL;

    INSERT INTO people (id, valid_from, email, phone, password_hash, modified_by, data)
    WITH readfields (key) AS (SELECT key FROM getpermissions('read'::permissions_type, 'people', _self_id, _people_id)),
         writefields (key) AS (SELECT key FROM getpermissions('write'::permissions_type, 'people', _self_id, _people_id))
    SELECT id, valid_till,
        CASE WHEN NOT _data ? 'email' THEN email WHEN 'email' IN (SELECT * FROM readfields) AND email = _data->>'email' OR 'email' IN (SELECT * FROM writefields) THEN _data->>'email' ELSE exception('writing "email" not allowed') END,
        CASE WHEN NOT _data ? 'phone' THEN phone WHEN 'phone' IN (SELECT * FROM readfields) AND phone = _data->>'phone' OR 'phone' IN (SELECT * FROM writefields) THEN _data->>'phone' ELSE exception('writing "phone" not allowed') END,
        password_hash,
        _self_id,
        (SELECT ('{' || STRING_AGG('"' ||
            CASE WHEN t2.key IS NULL THEN t1.key WHEN t2.key IN (SELECT * FROM writefields) OR t2.key IN (SELECT * FROM readfields) AND t1.value = t2.value THEN t2.key ELSE exception('writing "' || t2.key || '" not allowed') END
                || '":' || TO_JSON(COALESCE(t2.value, t1.value)), ',') || '}')::JSONB
            FROM JSONB_EACH(data) t1
            FULL OUTER JOIN (SELECT * FROM JSONB_EACH(DATA) WHERE key NOT IN ('email','phone')) t2 USING (key))
    FROM people WHERE id = _people_id ORDER BY valid_till DESC LIMIT 1;
    RETURN QUERY (SELECT * FROM getpeople(_self_id, people_id));
END;
$$ LANGUAGE plpgsql;


WITH readfields AS (
    SELECT DISTINCT key, self_id FROM viewpermissions WHERE type = 'read' AND ref_type = 'people' AND people_id = XXX
)
SELECT ('{' || (
    SELECT STRING_AGG('"' || key || '":' || TO_JSON(value), ',')
    FROM (SELECT * FROM JSONB_EACH(data) UNION
        VALUES
            ('gid'::TEXT, TO_JSON(gid)::JSONB),
            ('id', TO_JSON(id)::JSONB),
            ('valid_from', TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_from)))::JSONB),
            ('valid_till', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_till)))::JSONB, 'null'::JSONB)),
            ('email', COALESCE(TO_JSON(email)::JSONB, 'null'::JSONB)),
            ('phone', COALESCE(TO_JSON(phone)::JSONB, 'null'::JSONB)),
            ('password_hash', COALESCE(TO_JSON(password_hash)::JSONB, 'null'::JSONB)),
            ('modified_by', TO_JSON(modified_by)::JSONB),
            ('modified', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM modified)))::JSONB, 'null'::JSONB)),
            ('created', TO_JSON(FLOOR(EXTRACT(EPOCH FROM created)))::JSONB)
        ) alias
        WHERE key IN (SELECT key FROM readfields WHERE self_id IS NULL OR people.id = self_id))  || '}')::JSONB
    FROM people WHERE valid_till IS NULL;




CREATE OR REPLACE VIEW viewpermissions AS
    SELECT DISTINCT fields.name AS key, CASE WHEN groups.name = 'self' THEN people.id END AS self_id
     FROM
        fields JOIN permissions ON  permissions.ref_key = 'field' AND permissions.ref_value = fields.id AND permissions.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN groups_permissions ON permissions.id = groups_permissions.permissions_id AND groups_permissions.valid_till IS NULL
               JOIN groups ON groups.id = groups_permissions.groups_id AND groups.valid_till IS NULL
               JOIN people_groups ON (people_groups.groups_id = groups.id OR groups.name = 'self') AND people_groups.valid_till IS NULL
               JOIN people ON people_groups.people_id = people.id AND people.valid_till IS NULL;


        --WHERE permissions.type = type AND permissions.ref_type = 'people' AND people.id = selfid

WITH readfields AS (
    SELECT DISTINCT key, self_id FROM viewpermissions WHERE type = 'read' AND ref_type = 'people' AND people_id = XXX
)
SELECT ('{' || (
    SELECT STRING_AGG('"' || key || '":' || TO_JSON(value), ',')
    FROM (SELECT * FROM JSONB_EACH(data) UNION
        VALUES
            ('gid'::TEXT, TO_JSON(gid)::JSONB),
            ('id', TO_JSON(id)::JSONB),
            ('valid_from', TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_from)))::JSONB),
            ('valid_till', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_till)))::JSONB, 'null'::JSONB)),
            ('email', COALESCE(TO_JSON(email)::JSONB, 'null'::JSONB)),
            ('phone', COALESCE(TO_JSON(phone)::JSONB, 'null'::JSONB)),
            ('password_hash', COALESCE(TO_JSON(password_hash)::JSONB, 'null'::JSONB)),
            ('modified_by', TO_JSON(modified_by)::JSONB),
            ('modified', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM modified)))::JSONB, 'null'::JSONB)),
            ('created', TO_JSON(FLOOR(EXTRACT(EPOCH FROM created)))::JSONB)
        ) alias
        WHERE key IN (SELECT key FROM readfields WHERE self_id IS NULL OR people.id = self_id))  || '}')::JSONB
    FROM people WHERE valid_till IS NULL;

--Alternative for the current construction (with 1 id pass) is this less complex but longer construct (with 2 id passes)
--WITH readfields (key, forall) AS (
--    SELECT fields.name, TRUE FROM
--        fields JOIN fields_groups ON fields_groups.fields_id = fields.id AND fields_groups.valid_till IS NULL AND fields.valid_till IS NULL
--               JOIN groups ON groups.id = fields_groups.groups_id AND groups.valid_till IS NULL
--               JOIN people_groups ON people_groups.groups_id = groups.id AND people_groups.valid_till IS NULL
--               JOIN people ON people_groups.people_id = people.id AND people.valid_till IS NULL
--        WHERE read AND people.id = XXX
--    UNION
--    SELECT fields.name, FALSE FROM
--        fields JOIN fields_groups ON fields_groups.fields_id = fields.id AND fields_groups.valid_till IS NULL AND fields.valid_till IS NULL
--               JOIN groups ON groups.id = fields_groups.groups_id AND groups.valid_till IS NULL
--        WHERE read AND groups.name = 'self'
--)
--...
--        WHERE key IN (SELECT key FROM readfields WHERE forall OR people.id = XXX))  

--Raise exception function
CREATE OR REPLACE FUNCTION exception(text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION '%', $1; END; $$;
--Can also use: RAISE unique_violation USING MESSAGE = 'Duplicate user ID: ' || user_id;
--use:
SELECT exception('this is the problem');


--variables: XXX (member who is performing the action) YYY (write to member), DATA (JSON data to update)
BEGIN;
UPDATE people SET valid_till = NOW() WHERE id = YYY AND valid_till IS NULL;

INSERT INTO people (id, valid_from, email, phone, password_hash, modified_by, data)
WITH writefields (key) AS (
    SELECT DISTINCT fields.name FROM
        fields JOIN permissions ON  permissions.ref_key = 'field' AND permissions.ref_value = fields.id AND permissions.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN groups_permissions ON permissions.id = groups_permissions.permissions_id AND groups_permissions.valid_till IS NULL
               JOIN groups ON groups.id = groups_permissions.groups_id AND groups.valid_till IS NULL
               JOIN people_groups ON (people_groups.groups_id = groups.id OR groups.name = 'self') AND people_groups.valid_till IS NULL
               JOIN people ON people_groups.people_id = people.id AND (groups.name != 'self' OR people.id = XXX) AND people.valid_till IS NULL
        WHERE permissions.type = 'write' AND permissions.ref_type = 'people'
), readfields (key) AS (
    SELECT DISTINCT fields.name FROM
        fields JOIN permissions ON  permissions.ref_key = 'field' AND permissions.ref_value = fields.id AND permissions.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN groups_permissions ON permissions.id = groups_permissions.permissions_id AND groups_permissions.valid_till IS NULL
               JOIN groups ON groups.id = groups_permissions.groups_id AND groups.valid_till IS NULL
               JOIN people_groups ON (people_groups.groups_id = groups.id OR groups.name = 'self') AND people_groups.valid_till IS NULL
               JOIN people ON people_groups.people_id = people.id AND (groups.name != 'self' OR people.id = XXX) AND people.valid_till IS NULL
        WHERE permissions.type = 'read' AND permissions.ref_type = 'people'
)
SELECT id, valid_till,
    CASE WHEN NOT (DATA)::JSONB ? 'email' THEN email WHEN 'email' IN (SELECT * FROM readfields) AND email = (DATA)::JSONB->>'email' OR 'email' IN (SELECT * FROM writefields) THEN (DATA)::JSONB->>'email' ELSE '' || exception('writing "email" not allowed') END,
    CASE WHEN NOT (DATA)::JSONB ? 'phone' THEN phone WHEN 'phone' IN (SELECT * FROM readfields) AND phone = (DATA)::JSONB->>'phone' OR 'phone' IN (SELECT * FROM writefields) THEN (DATA)::JSONB->>'phone' ELSE '' || exception('writing "phone" not allowed') END,
    password_hash,
    XXX,
    (SELECT ('{' || STRING_AGG('"' ||
        CASE WHEN t2.key IS NULL THEN t1.key WHEN t2.key IN (SELECT * FROM writefields) OR t2.key IN (SELECT * FROM readfields) AND t1.value = t2.value THEN t2.key ELSE '' || exception('writing "' || t2.key || '" not allowed') END
            || '":' || TO_JSON(COALESCE(t2.value, t1.value)), ',') || '}')::JSONB
        FROM JSONB_EACH(data) t1
        FULL OUTER JOIN (SELECT * FROM JSONB_EACH(DATA) WHERE key NOT IN ('email','phone')) t2 USING (key))
FROM people WHERE id = YYY ORDER BY valid_till DESC LIMIT 1;

COMMIT;

--try '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikkert"}' with 2 2 will succeed
--    '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikker"}' with 2 2 will error
--    '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikker"}' with 2 3 will succeed