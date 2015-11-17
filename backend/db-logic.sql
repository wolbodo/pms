--Select all members with the fields for member id XXX
WITH readfields (key, selfid) AS (
    SELECT DISTINCT fields.name, CASE WHEN roles.name = 'self' THEN members.id END FROM
        fields JOIN fields_roles ON fields_roles.fields_id = fields.id AND fields_roles.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN roles ON roles.id = fields_roles.roles_id AND roles.valid_till IS NULL
               JOIN members_roles ON (members_roles.roles_id = roles.id OR roles.name = 'self') AND members_roles.valid_till IS NULL
               JOIN members ON members_roles.members_id = members.id AND members.valid_till IS NULL
        WHERE read AND members.id = XXX
)
SELECT (
    SELECT ('{' || STRING_AGG('"' || key || '":' || TO_JSON(value), ',') || '}')::JSONB
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
        WHERE key IN (SELECT key FROM readfields WHERE selfid IS NULL OR members.id = selfid))  
    FROM members WHERE valid_till IS NULL;

--Alternative for the current construction (with 1 id pass) is this less complex but longer construct (with 2 id passes)
--WITH readfields (key, forall) AS (
--    SELECT fields.name, TRUE FROM
--        fields JOIN fields_roles ON fields_roles.fields_id = fields.id AND fields_roles.valid_till IS NULL AND fields.valid_till IS NULL
--               JOIN roles ON roles.id = fields_roles.roles_id AND roles.valid_till IS NULL
--               JOIN members_roles ON members_roles.roles_id = roles.id AND members_roles.valid_till IS NULL
--               JOIN members ON members_roles.members_id = members.id AND members.valid_till IS NULL
--        WHERE read AND members.id = XXX
--    UNION
--    SELECT fields.name, FALSE FROM
--        fields JOIN fields_roles ON fields_roles.fields_id = fields.id AND fields_roles.valid_till IS NULL AND fields.valid_till IS NULL
--               JOIN roles ON roles.id = fields_roles.roles_id AND roles.valid_till IS NULL
--        WHERE read AND roles.name = 'self'
--)
--...
--        WHERE key IN (SELECT key FROM readfields WHERE forall OR members.id = XXX))  

--Raise exception function
CREATE OR REPLACE FUNCTION exception(text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION '%', $1; END; $$;
--Can also use: RAISE unique_violation USING MESSAGE = 'Duplicate user ID: ' || user_id;
--use:
SELECT exception('this is the problem');


--variables: XXX (member who is performing the action) YYY (write to member), DATA (JSON data to update)
BEGIN;
UPDATE members SET valid_till = NOW() WHERE id = YYY AND valid_till IS NULL;

INSERT INTO members (id, valid_from, email, phone, password_hash, modified_by, data)
WITH writefields (key) AS (
    SELECT DISTINCT fields.name FROM
        fields JOIN fields_roles ON fields_roles.fields_id = fields.id AND fields_roles.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN roles ON roles.id = fields_roles.roles_id AND roles.valid_till IS NULL
               JOIN members_roles ON (members_roles.roles_id = roles.id OR roles.name = 'self' AND YYY = XXX) AND members_roles.valid_till IS NULL
               JOIN members ON members_roles.members_id = members.id
        WHERE write AND members.id = XXX
), readfields (key) AS (
    SELECT DISTINCT fields.name FROM
        fields JOIN fields_roles ON fields_roles.fields_id = fields.id AND fields_roles.valid_till IS NULL AND fields.valid_till IS NULL
               JOIN roles ON roles.id = fields_roles.roles_id AND roles.valid_till IS NULL
               JOIN members_roles ON (members_roles.roles_id = roles.id OR roles.name = 'self' AND YYY = XXX) AND members_roles.valid_till IS NULL
               JOIN members ON members_roles.members_id = members.id
        WHERE read AND members.id = XXX
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
FROM members WHERE id = YYY ORDER BY valid_till DESC LIMIT 1;

COMMIT;

--try '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikkert"}' with 2 2 will succeed
--    '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikker"}' with 2 2 will error
--    '{"email":"test@example.com","city":"Amsterdam","nickname":"Wikkert"}' with 2 3 will succeed
