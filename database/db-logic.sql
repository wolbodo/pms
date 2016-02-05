CREATE OR REPLACE FUNCTION public.base64url2jsonb(json text, info text DEFAULT ''::text)
 RETURNS jsonb
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


CREATE OR REPLACE FUNCTION public.jsonb2base64url(jsonbytes jsonb)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN TRANSLATE(ENCODE(jsonbytes::TEXT::BYTEA, 'base64'), '+/=', '-_');
END
$function$;


CREATE OR REPLACE FUNCTION public.parsejwt(token text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  header JSONB;
  payload JSONB;
  match TEXT[];
--  debug1 TEXT;
--  debug2 TEXT;
BEGIN
    match = REGEXP_MATCHES(token, '^(([a-zA-Z0-9_=-]+)\.([a-zA-Z0-9_=-]+))\.([a-zA-Z0-9_=-]+)$');
    header = base64url2jsonb(match[2]);
    payload = base64url2jsonb(match[3]);
    IF match[3] != TRANSLATE(ENCODE(HMAC(match[0], 'secret', 'sha256'), 'base64'), '+/=', '-_') THEN
      RAISE EXCEPTION 'Invalid signature';
      RETURN NULL;
    END IF;
    IF NOT payload ? 'exp' OR (payload->>'exp')::INT < FLOOR(EXTRACT(EPOCH FROM NOW())) THEN
      RAISE EXCEPTION 'Expired';
      RETURN NULL;
    END IF;
    RETURN payload;
--EXCEPTION
----    WHEN invalid_parameter_value THEN
----        RAISE EXCEPTION '%', 'error';
----        RETURN NULL;
--    WHEN OTHERS THEN
--        GET STACKED DIAGNOSTICS debug1 = MESSAGE_TEXT,
--                          debug3 = PG_EXCEPTION_CONTEXT;
--        RAISE EXCEPTION 'Error "%" (%).', debug1, debug2
--        RETURN NULL;
END
$function$;


CREATE OR REPLACE FUNCTION public.login(emailaddress text, password text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  header JSONB;
  payload JSONB;
  content TEXT;
  signature TEXT;
BEGIN
  header = '{"type":"jwt", "alg":"hs256"}'::JSONB;
  SELECT ('{ "user":' || TO_JSON(p.id) || ',"exp":' || FLOOR(EXTRACT(EPOCH FROM NOW() + interval '31 days')) || '}')::JSONB INTO payload
      FROM people p 
      JOIN people_roles pr ON pr.people_id = p.id AND p.valid_till IS NULL AND pr.valid_till IS NULL
      JOIN roles r ON pr.roles_id = r.id AND r.valid_till IS NULL
      WHERE p.email = emailaddress AND crypt(password, p.password_hash) = p.password_hash AND r.name = 'login';
  IF payload IS NULL THEN
      RAISE EXCEPTION 'Username or password wrong.';
      RETURN NULL;
  END IF;
  content = jsonb2base64url(header) || '.' || jsonb2base64url(payload);
  signature = TRANSLATE(ENCODE(HMAC(content, 'secret', 'sha256'), 'base64'), '+/=', '-_');
  RETURN content || '.' || signature;
END
$function$;


CREATE OR REPLACE FUNCTION public.hasrole(self_id integer, role_name varchar)
 RETURNS bool
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


CREATE OR REPLACE FUNCTION public.getfieldpermissions(permissions_type permissions_type, ref_type character varying, self_id integer)
 RETURNS TABLE(key character varying, selfid integer)
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

CREATE OR REPLACE FUNCTION public.getfieldpermissions(permissions_type permissions_type, ref_type character varying, self_id integer, people_id integer)
 RETURNS varchar[]
 LANGUAGE plpgsql
AS $function$
DECLARE
    _permissions_type ALIAS FOR permissions_type;
    _ref_type ALIAS FOR ref_type;
    _self_id ALIAS FOR self_id;
    _people_id ALIAS FOR people_id;
    returnvalue varchar[];
BEGIN
  SELECT array_agg(DISTINCT f.name) INTO returnvalue
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


CREATE OR REPLACE FUNCTION public.getpeople(token text, people_id integer DEFAULT '-1'::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    _self_id int;
    returnvalue jsonb;
BEGIN
    _self_id = parsejwt(token)->'user';
    WITH readfields AS (SELECT * FROM getfieldpermissions('read'::permissions_type, 'people', _self_id))
    SELECT jsonb_agg((SELECT jsonb_object_agg(key, value)
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
        WHERE key IN (SELECT key FROM readfields WHERE selfid IS NULL OR people.id = _self_id))) INTO returnvalue
        FROM people WHERE valid_till IS NULL AND (people.id = people_id OR -1 = people_id);
    RETURN returnvalue;
END;
$function$;


CREATE OR REPLACE FUNCTION public.jsonb_merge(base jsonb = '{}'::JSONB, update jsonb = '{}'::JSONB, read text[] = ARRAY[]::text[], write text[] = ARRAY[]::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    kv record;
BEGIN
    FOR kv IN (SELECT * FROM JSONB_EACH(update))
    LOOP
        IF NOT (array[kv.key] <@ write OR (array[kv.key] <@ read AND base ? kv.key AND base->kv.key = update->kv.key)) THEN
            RAISE EXCEPTION 'writing "%" not allowed', kv.key;
            RETURN NULL;
        END IF;
    END LOOP;
    RETURN base || update;
END;
$function$;


CREATE OR REPLACE FUNCTION public.remove_base(base jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    field text;
BEGIN
    FOREACH field IN ARRAY array['gid', 'id', 'valid_from', 'valid_till', 'password_hash', 'modified_by', 'modified', 'created'] LOOP
        base = base -field;
    END LOOP;
    RETURN base;
END;
$function$;


CREATE OR REPLACE FUNCTION public.setperson(token text, people_id integer, data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    self_id int;
    _data ALIAS FOR data;
BEGIN
    self_id = parsejwt(token)->'user';
    _data = remove_base(jsonb_merge(
        base := getpeople(token, people_id)->0,
        update := _data,
        read := getfieldpermissions('read'::permissions_type, 'people', self_id, people_id),
        write := getfieldpermissions('write'::permissions_type, 'people', self_id, people_id)
    ));

    UPDATE people SET valid_till = NOW() WHERE id = people_id AND valid_till IS NULL;

    INSERT INTO people (id, valid_from, email, phone, password_hash, modified_by, data)
        SELECT id, valid_till, _data->>'email', _data->>'phone', password_hash, self_id, _data -'email' -'phone'
            FROM people WHERE id = people_id ORDER BY valid_till DESC LIMIT 1;

    RETURN getpeople(token, people_id)->0;
END;
$function$;


CREATE OR REPLACE FUNCTION public.addperson(token text, data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    self_id int;
    _data ALIAS FOR data;
    people_id integer;
BEGIN
    self_id = parsejwt(token)->'user';
    _data = remove_base(jsonb_merge(
        update := _data,
        read := getfieldpermissions('read'::permissions_type, 'people', self_id, -1),
        write := getfieldpermissions('write'::permissions_type, 'people', self_id, -1)
    ));

    INSERT INTO people (email, phone, modified_by, data)
        VALUES (_data->>'email', _data->>'phone', self_id, _data -'email' -'phone') RETURNING id INTO people_id;

    RETURN getpeople(token, people_id)->0;
END;
$function$;
