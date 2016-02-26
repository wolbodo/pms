CREATE OR REPLACE FUNCTION public.base64url_jsonb(json TEXT, info TEXT DEFAULT ''::TEXT)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
  debug1 TEXT;
BEGIN
    RETURN CONVERT_FROM(DECODE(TRANSLATE(json || REPEAT('=', LENGTH(json) * 6 % 8 / 2), '-_',''), 'base64'), 'UTF-8')::JSONB;
    EXCEPTION
        WHEN invalid_parameter_value THEN
            GET STACKED DIAGNOSTICS debug1 = MESSAGE_TEXT;
            RAISE EXCEPTION  'E: % %', info, debug1;
            RETURN NULL;
END
$function$;


CREATE OR REPLACE FUNCTION public.jsonb_base64url(jsonbytes JSONB)
 RETURNS TEXT
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN TRANSLATE(ENCODE(jsonbytes::TEXT::BYTEA, 'base64'), '+/=', '-_');
END
$function$;


CREATE OR REPLACE FUNCTION public.parse_jwt(token TEXT)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
  header JSONB;
  payload JSONB;
  match TEXT[];
BEGIN
    match = REGEXP_MATCHES(token, '^(([a-zA-Z0-9_=-]+)\.([a-zA-Z0-9_=-]+))\.([a-zA-Z0-9_=-]+)$');
    header = base64url_jsonb(match[2]);
    payload = base64url_jsonb(match[3]);
    IF match IS NULL OR match[4] != TRANSLATE(ENCODE(HMAC(match[1], :'token_sha256_key', 'sha256'), 'base64'), '+/=', '-_') THEN
      RAISE EXCEPTION 'Invalid signature';
      RETURN NULL;
    END IF;
    IF NOT payload ? 'exp' OR (payload->>'exp')::INT < FLOOR(EXTRACT(EPOCH FROM NOW())) THEN
      RAISE EXCEPTION 'Expired';
      RETURN NULL;
    END IF;
    RETURN payload;
END
$function$;


CREATE OR REPLACE FUNCTION public.login(emailaddress TEXT, password TEXT)
 RETURNS TEXT
 LANGUAGE plpgsql
AS $function$
DECLARE
  header JSONB;
  payload JSONB;
  content TEXT;
  signature TEXT;
BEGIN
  header = '{"type":"jwt", "alg":"hs256"}'::JSONB;
  SELECT ('{ "user":' || TO_JSON(p.id) || ',"exp":' || FLOOR(EXTRACT(EPOCH FROM NOW() + INTERVAL '31 days')) || '}')::JSONB INTO STRICT payload
      FROM people p
      JOIN people_roles pr ON pr.people_id = p.id AND p.valid_till IS NULL AND pr.valid_till IS NULL
      JOIN roles r ON pr.roles_id = r.id AND r.valid_till IS NULL
      WHERE p.email = emailaddress AND CRYPT(password, p.password_hash) = p.password_hash AND r.name = 'login';
  content = jsonb_base64url(header) || '.' || jsonb_base64url(payload);
  signature = TRANSLATE(ENCODE(HMAC(content, :'token_sha256_key', 'sha256'), 'base64'), '+/=', '-_');
  RETURN content || '.' || signature;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION 'Username or password wrong.';
      RETURN NULL;
    WHEN TOO_MANY_ROWS THEN
      RAISE EXCEPTION 'More than one entry found, please contact an admin or board member to fix this.';
      RETURN NULL;
END
$function$;


CREATE OR REPLACE FUNCTION public.has_role(self_id INT, role_name VARCHAR)
 RETURNS BOOL
 LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM FROM roles r
               JOIN people_roles pr ON (pr.roles_id = r.id OR r.name = 'self') AND pr.valid_till IS NULL AND r.valid_till IS NULL
               JOIN people p ON pr.people_id = p.id AND r.name != 'self' AND p.valid_till IS NULL
      WHERE p.id = self_id AND r.name = role_name;
  IF NOT FOUND THEN
      RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$function$;


DROP TYPE IF EXISTS "payload_permissions" CASCADE;
CREATE TYPE "payload_permissions" AS (
  payload   JSONB,
  permissions  JSONB
);


CREATE OR REPLACE FUNCTION public.permissions_get(token TEXT)
 RETURNS payload_permissions
 LANGUAGE plpgsql
AS $function$
DECLARE
    payload JSONB;
    permissions JSONB;
BEGIN
    payload = parse_jwt(token);

    SELECT JSONB_OBJECT_AGG(ref_table, json) INTO permissions FROM (
        SELECT
            ref_table,
            JSONB_OBJECT_AGG(rule.key, rule.value) FILTER (WHERE rule.key IS NOT NULL) ||
                COALESCE(NULLIF(
                    JSONB_BUILD_OBJECT('self', COALESCE(JSONB_OBJECT_AGG(selfrule.key, selfrule.value) FILTER (WHERE selfrule.key IS NOT NULL), '{}'::JSONB)),
                    '{"self":{}}'
                ),'{}') AS json
        FROM (
            SELECT pm.ref_table,
                CASE
                    WHEN NOT (r.name = 'self') AND type IN ('read'::permissions_type, 'write'::permissions_type) THEN
                        JSONB_BUILD_OBJECT(type, jsonb_agg(DISTINCT f.name))
                    WHEN type IN ('read'::permissions_type, 'write'::permissions_type) THEN
                        JSONB_BUILD_OBJECT('self', JSONB_BUILD_OBJECT(type, jsonb_agg(DISTINCT f.name)))
                    WHEN type = 'create'::permissions_type THEN
                        JSONB_BUILD_OBJECT(type, JSONB_BUILD_OBJECT(ref_key, COALESCE(NULLIF(JSONB_AGG(ref_value),'[null]'),'true'::JSONB)))
                    WHEN type = 'custom'::permissions_type THEN
                        JSONB_BUILD_OBJECT(ref_key, COALESCE(NULLIF(JSONB_AGG(ref_value),'[null]'),'true'::JSONB))
                END AS json
            FROM permissions pm
                JOIN roles_permissions rpm ON pm.id = rpm.permissions_id AND pm.valid_till IS NULL AND rpm.valid_till IS NULL
                JOIN roles r ON r.id = rpm.roles_id AND r.valid_till IS NULL
                JOIN people_roles pr ON (pr.roles_id = r.id OR r.name = 'self') AND pr.valid_till IS NULL
                --JOIN people p ON pr.people_id = p.id AND p.id = _self_id AND (r.name != 'self' OR _people_id = _self_id) AND p.valid_till IS NULL
                LEFT JOIN fields f ON pm.ref_key = 'fields' AND pm.ref_value = f.id AND f.valid_till IS NULL
            WHERE pr.people_id = (payload->>'user')::INT
            GROUP BY pm.ref_table, pm.type, pm.ref_key, r.name = 'self'
        ) rules
            LEFT JOIN JSONB_EACH(rules.json - 'self') rule ON TRUE
            LEFT JOIN JSONB_EACH(rules.json->'self') selfrule ON TRUE
        GROUP BY rules.ref_table
    ) alias;
    RETURN (payload, permissions);
END;
$function$;


--NOTE: ONLY expose this function internally! (otherwise we have a huuuuuge security issue)
CREATE OR REPLACE FUNCTION public.people_get(rights payload_permissions, people_id INT DEFAULT '-1'::INT)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    people JSONB;
BEGIN
    SELECT JSONB_AGG(object) INTO people
        FROM (
            SELECT (
                SELECT JSONB_OBJECT_AGG(key, value)
                FROM (SELECT key, value FROM JSONB_EACH(data)
                    UNION
                    VALUES
                        ('gid'::TEXT, TO_JSON(gid)::JSONB),
                        ('id', TO_JSON(id)::JSONB),
                        ('valid_from', TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_from)))::JSONB),
                        ('valid_till', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM valid_till))), 'null')::JSONB),
                        ('email', COALESCE(TO_JSON(email), 'null')::JSONB),
                        ('phone', COALESCE(TO_JSON(phone), 'null')::JSONB),
                        ('password_hash', COALESCE(TO_JSON(password_hash), 'null')::JSONB),
                        ('modified_by', TO_JSON(modified_by)::JSONB),
                        ('modified', COALESCE(TO_JSON(FLOOR(EXTRACT(EPOCH FROM modified))), 'null')::JSONB),
                        ('created', TO_JSON(FLOOR(EXTRACT(EPOCH FROM created)))::JSONB)
                ) alias
                WHERE
                    rights.permissions->'people'->'read' ? key
                    OR (
                        people.id = (rights.payload->>'user')::INT
                        AND rights.permissions->'people'->'self'->'read' ? key
                    )
            )
            FROM people WHERE valid_till IS NULL AND (people.id = people_id OR -1 = people_id)
        ) alias (object) WHERE object IS NOT NULL;
    IF people_id = -1 THEN
        RETURN people;
    ELSE
        RETURN people->0;
    END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.people_get(token TEXT, people_id INT DEFAULT '-1'::INT)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN people_get(rights := permissions_get(token), people_id := people_id);
END;
$function$;

--TODO: count(writeonly OR write & !current value) > 0 else RAISE EXCEPTION 'no empty updates please'
CREATE OR REPLACE FUNCTION public.data_merge(rights payload_permissions, ref_table VARCHAR, base JSONB = '{}'::JSONB, update JSONB = '{}'::JSONB)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    kv record;
    readfields JSONB;
    writefields JSONB;
BEGIN
    readfields = rights.permissions->ref_table->'read';
    writefields = rights.permissions->ref_table->'write';
    IF ref_table = 'people' AND (base->>'id')::INT = (rights.payload->>'user')::INT THEN
        readfields = COALESCE(readfields, '[]'::JSONB) || COALESCE(rights.permissions->ref_table->'self'->'read', '[]'::JSONB);
        writefields = COALESCE(writefields, '[]'::JSONB) || COALESCE(rights.permissions->ref_table->'self'->'write', '[]'::JSONB);
    END IF;
    IF base = '{}'::JSONB THEN
        --support create { key1->[value1], key2->[value2, value3] }
        IF rights.permissions->ref_table->'create'->'*' THEN
            --OK, this construct is chosen because missing JSON objects resolve in NULL, which are way more tricky to handle correctly in one IF.
        ELSE
            RAISE EXCEPTION 'creating "%" not allowed', ref_table;
            RETURN NULL;
        END IF;
    END IF;
    FOR kv IN (SELECT * FROM JSONB_EACH(update))
    LOOP
        IF writefields ? kv.key OR (readfields ? kv.key AND base->kv.key = update->kv.key) THEN
            --OK, this construct is chosen because NULL in write, read and base->kv.key is way more tricky to handle correctly in one IF.
        ELSE
            RAISE EXCEPTION 'writing "%" not allowed', kv.key;
            RETURN NULL;
        END IF;
    END LOOP;
    RETURN base || update;
END;
$function$;


CREATE OR REPLACE FUNCTION public.remove_base(base JSONB)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    field VARCHAR;
BEGIN
    FOREACH field IN ARRAY ARRAY['gid', 'id', 'valid_from', 'valid_till', 'password_hash', 'modified_by', 'modified', 'created'] LOOP
        base = base -field;
    END LOOP;
    RETURN base;
END;
$function$;

CREATE OR REPLACE FUNCTION public.person_set(token TEXT, people_id INT, data JSONB)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    rights payload_permissions;
    _data ALIAS FOR data;
BEGIN
    rights = permissions_get(token);
    _data = remove_base(data_merge(
        rights := rights,
        ref_table := 'people',
        base := people_get(rights, people_id),
        update := _data
    ));

    UPDATE people SET valid_till = NOW() WHERE id = people_id AND valid_till IS NULL;

    INSERT INTO people (id, valid_from, email, phone, password_hash, modified_by, data)
        SELECT id, valid_till, _data->>'email', _data->>'phone', password_hash, (rights.payload->>'user')::INT, _data -'email' -'phone'
            FROM people WHERE id = people_id ORDER BY valid_till DESC LIMIT 1;

    RETURN people_get(rights, people_id);
END;
$function$;


CREATE OR REPLACE FUNCTION public.person_add(token TEXT, data JSONB)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    rights payload_permissions;
    _data ALIAS FOR data;
    people_id INT;
BEGIN
    rights = permissions_get(token);
    _data = remove_base(data_merge(
        rights := rights,
        ref_table := 'people',
        update := _data
    ));

    INSERT INTO people (email, phone, modified_by, data)
        VALUES (_data->>'email', _data->>'phone', (rights.payload->>'user')::INT, _data -'email' -'phone') RETURNING id INTO people_id;

    RETURN people_get(rights, people_id);
END;
$function$;
