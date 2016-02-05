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
    IF match IS NULL OR match[4] != TRANSLATE(ENCODE(HMAC(match[1], 'FIXME: this is a secret value that should better be replaced otherwise we are seriously fucked!', 'sha256'), 'base64'), '+/=', '-_') THEN
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
  SELECT ('{ "user":' || TO_JSON(p.id) || ',"exp":' || FLOOR(EXTRACT(EPOCH FROM NOW() + INTERVAL '31 days')) || '}')::JSONB INTO payload
      FROM people p
      JOIN people_roles pr ON pr.people_id = p.id AND p.valid_till IS NULL AND pr.valid_till IS NULL
      JOIN roles r ON pr.roles_id = r.id AND r.valid_till IS NULL
      WHERE p.email = emailaddress AND CRYPT(password, p.password_hash) = p.password_hash AND r.name = 'login';
  IF payload IS NULL THEN
      RAISE EXCEPTION 'Username or password wrong.';
      RETURN NULL;
  END IF;
  content = jsonb_base64url(header) || '.' || jsonb_base64url(payload);
  signature = TRANSLATE(ENCODE(HMAC(content, 'FIXME: this is a secret value that should better be replaced otherwise we are seriously fucked!', 'sha256'), 'base64'), '+/=', '-_');
  RETURN content || '.' || signature;
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


CREATE OR REPLACE FUNCTION public.get_field_permissions(permissions_type PERMISSIONS_TYPE, ref_type VARCHAR, self_id INT)
 RETURNS TABLE(key VARCHAR, selfid INT)
 LANGUAGE plpgsql
AS $function$
DECLARE
    _permissions_type ALIAS FOR permissions_type;
    _ref_type ALIAS FOR ref_type;
    _self_id ALIAS FOR self_id;
--    _people_id ALIAS FOR people_id;
BEGIN
  RETURN QUERY (SELECT DISTINCT f.name, CASE WHEN r.name = 'self' THEN p.id END
     FROM fields f
     JOIN permissions pm ON pm.ref_key = 'field' AND pm.ref_value = f.id AND pm.valid_till IS NULL AND f.valid_till IS NULL
     JOIN roles_permissions rpm ON pm.id = rpm.permissions_id AND rpm.valid_till IS NULL
     JOIN roles r ON r.id = rpm.roles_id AND r.valid_till IS NULL
     JOIN people_roles pr ON (pr.roles_id = r.id OR r.name = 'self') AND pr.valid_till IS NULL
     JOIN people p ON pr.people_id = p.id AND p.id = _self_id --AND (r.name != 'self' OR _people_id = -1 OR _people_id = _self_id) AND p.valid_till IS NULL
     WHERE pm.type = _permissions_type AND pm.ref_type = _ref_type);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_field_permissions(permissions_type PERMISSIONS_TYPE, ref_type VARCHAR, self_id INT, people_id INT)
 RETURNS VARCHAR[]
 LANGUAGE plpgsql
AS $function$
DECLARE
    _permissions_type ALIAS FOR permissions_type;
    _ref_type ALIAS FOR ref_type;
    _self_id ALIAS FOR self_id;
    _people_id ALIAS FOR people_id;
    returnvalue VARCHAR[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT f.name) INTO returnvalue
     FROM fields f
     JOIN permissions pm ON pm.ref_key = 'field' AND pm.ref_value = f.id AND pm.valid_till IS NULL AND f.valid_till IS NULL
     JOIN roles_permissions rpm ON pm.id = rpm.permissions_id AND rpm.valid_till IS NULL
     JOIN roles r ON r.id = rpm.roles_id AND r.valid_till IS NULL
     JOIN people_roles pr ON (pr.roles_id = r.id OR r.name = 'self') AND pr.valid_till IS NULL
     JOIN people p ON pr.people_id = p.id AND p.id = _self_id AND (r.name != 'self' OR _people_id = _self_id) AND p.valid_till IS NULL
     WHERE pm.type = _permissions_type AND pm.ref_type = _ref_type;
  RETURN returnvalue;
END;
$function$;


CREATE OR REPLACE FUNCTION public.people_get(token TEXT, people_id INT DEFAULT '-1'::INT)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    _self_id INT;
    returnvalue JSONB;
BEGIN
    _self_id = parse_jwt(token)->'user';
    WITH readfields AS (SELECT * FROM get_field_permissions('read'::PERMISSIONS_TYPE, 'people', _self_id))
    SELECT JSONB_AGG(object) INTO returnvalue
        FROM (
            SELECT (SELECT JSONB_OBJECT_AGG(key, value)
            FROM (SELECT * FROM JSONB_EACH(data)
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
            WHERE key IN (SELECT key FROM readfields WHERE selfid IS NULL OR people.id = _self_id))
            FROM people WHERE valid_till IS NULL AND (people.id = people_id OR -1 = people_id)
        ) alias (object) WHERE object IS NOT NULL;
    IF people_id = -1 THEN
        RETURN returnvalue;
    ELSE
        RETURN returnvalue->0;
    END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.jsonb_merge(base JSONB = '{}'::JSONB, update JSONB = '{}'::JSONB, read text[] = ARRAY[]::text[], write text[] = ARRAY[]::text[])
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    kv record;
BEGIN
    FOR kv IN (SELECT * FROM JSONB_EACH(update))
    LOOP
        IF NOT (ARRAY[kv.key] <@ write OR (ARRAY[kv.key] <@ read AND base ? kv.key AND base->kv.key = update->kv.key)) THEN
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
    self_id INT;
    _data ALIAS FOR data;
BEGIN
    self_id = parse_jwt(token)->'user';
    _data = remove_base(jsonb_merge(
        base := getpeople(token, people_id),
        update := _data,
        read := get_field_permissions('read'::PERMISSIONS_TYPE, 'people', self_id, people_id),
        write := get_field_permissions('write'::PERMISSIONS_TYPE, 'people', self_id, people_id)
    ));

    UPDATE people SET valid_till = NOW() WHERE id = people_id AND valid_till IS NULL;

    INSERT INTO people (id, valid_from, email, phone, password_hash, modified_by, data)
        SELECT id, valid_till, _data->>'email', _data->>'phone', password_hash, self_id, _data -'email' -'phone'
            FROM people WHERE id = people_id ORDER BY valid_till DESC LIMIT 1;

    RETURN people_get(token, people_id);
END;
$function$;


CREATE OR REPLACE FUNCTION public.person_add(token TEXT, data JSONB)
 RETURNS JSONB
 LANGUAGE plpgsql
AS $function$
DECLARE
    self_id INT;
    _data ALIAS FOR data;
    people_id INT;
BEGIN
    self_id = parse_jwt(token)->'user';
    _data = remove_base(jsonb_merge(
        update := _data,
        read := get_field_permissions('read'::PERMISSIONS_TYPE, 'people', self_id, -1),
        write := get_field_permissions('write'::PERMISSIONS_TYPE, 'people', self_id, -1)
    ));

    INSERT INTO people (email, phone, modified_by, data)
        VALUES (_data->>'email', _data->>'phone', self_id, _data -'email' -'phone') RETURNING id INTO people_id;

    RETURN people_get(token, people_id);
END;
$function$;
