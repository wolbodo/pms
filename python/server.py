import aiopg
import asyncio
import requests

import tornado.concurrent
import tornado.web
import tornado.platform.asyncio

import tornado.autoreload

import json

DSN = 'dbname=pms user=pms'
HOSTNAME = 'localhost'
PORT = 4242

pool = None


def coroutine(func):
    func = asyncio.coroutine(func)

    def decorator(*args, **kwargs):
        future = tornado.concurrent.Future()

        def future_done(f):
            try:
                future.set_result(f.result())
            except Exception as e:
                future.set_exception(e)
        asyncio.async(func(*args, **kwargs)).add_done_callback(future_done)
        return future
    return decorator


@asyncio.coroutine
def aio_requests():
    def do_req():
        return requests.get("http://google.com")
    loop = asyncio.get_event_loop()
    req = loop.run_in_executor(None, do_req)
    resp = yield from req
    print(resp.status_code)

# post "/login" => handle_login,

# get "/people" => handle_people_get,
# post "/people" => handle_person_add,
# get "/person/:id" => handle_people_get,
# put "/person/:id" => handle_person_set,

# get "/fields" => handle_fields,
# put "/fields" => handle_fields_edit


class DatabaseHandler(tornado.web.RequestHandler):
    @coroutine
    def initialize(self, pool):
        self.pool = pool


class LoginHandler(DatabaseHandler):
    @coroutine
    def post(self):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                # Login
                yield from cur.execute("SELECT login(emailaddress := %(user)s, password := %(password)s);",
                                       json.loads(self.request.body.decode('utf-8'))
                                       )
                token = yield from cur.fetchone()

                # Get permissions
                yield from cur.execute("SELECT (permissions_get(token := %(token)s)).permissions;", {
                    'token': token[0]
                })
                permissions = yield from cur.fetchone()

                self.write({
                    'token': token[0], 
                    'permissions': permissions[0]
                })
            finally:
                cur.close()

        print('done with request')


class FieldsHandler(DatabaseHandler):
    @coroutine
    def get(self, table=None):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT fields_get(token := %(token)s, ref_table := %(table)s);", {
                    'token': self.request.headers['Authorization'],
                    'table': table
                })
                row = yield from cur.fetchone()
                self.set_header('Content-Type', 'application/json')
                self.write(json.dumps(row[0]))  # Normally tornado transforms objects into JSON, except for lists.
            finally:
                cur.close()

        print('done with request')


class RolesHandler(DatabaseHandler):
    @coroutine
    def get(self, roles_id):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT roles_get(token := %(token)s, roles_id := %(roles_id)s);", {
                    'token': self.request.headers['Authorization'],
                    'roles_id': roles_id or -1
                })
                row = yield from cur.fetchone()
                self.set_header('Content-Type', 'application/json')
                self.write(json.dumps(row[0]))  # Normally tornado transforms objects into JSON, except for lists.
            finally:
                cur.close()

        print('done with request')


class PermissionsHandler(DatabaseHandler):
    @coroutine
    def get(self):
        """Returns the self-permissions for now. Should return all permissions"""
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT (permissions_get(token := %(token)s)).permissions;", {
                    'token': self.request.headers['Authorization']
                })
                row = yield from cur.fetchone()
                self.write(row[0])
            finally:
                cur.close()

        print('done with request')


class PeopleHandler(DatabaseHandler):
    @coroutine
    def get(self, people_id=-1):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT people_get(token := %(token)s, people_id := %(people_id)s);", {
                    'token': self.request.headers['Authorization'],
                    'people_id': people_id
                })
                row = yield from cur.fetchone()
                self.set_header('Content-Type', 'application/json')
                self.write(json.dumps(row[0]))  # Normally tornado transforms objects into JSON, except for lists.
            finally:
                cur.close()

        print('done with request')

    @coroutine
    def put(self, people_id):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT people_set(token := %(token)s, people_id := %(people_id)s, data := %(body)s);", {
                    'token': self.request.headers['Authorization'],
                    'people_id': people_id,
                    'body': self.request.body.decode('utf-8')
                })
                row = yield from cur.fetchone()
                self.write(row[0])
            finally:
                cur.close()

        print('done with request')

    @coroutine
    def post(self):
        with (yield from self.pool) as conn:
            cur = yield from conn.cursor()
            try:
                yield from cur.execute("SELECT people_add(token := %(token)s, data := %(body)s);", {
                    'token': self.request.headers['Authorization'],
                    'body': self.request.body.decode('utf-8')
                })
                row = yield from cur.fetchone()
                self.write(row[0])  # Normally tornado transforms objects into JSON, except for lists.
            finally:
                cur.close()

        print('done with request')


@asyncio.coroutine
def init_database(dsn):
    global pool

    pool = yield from aiopg.create_pool(dsn)


def start_server(r):
    app = tornado.web.Application([
        (r'/login', LoginHandler, {'pool': pool}),

        (r'/person/(\d+)', PeopleHandler, {'pool': pool}),  # GET, PUT
        (r'/people', PeopleHandler, {'pool': pool}),       # GET, POST

        (r'/fields/?([^.]+)?', FieldsHandler, {'pool': pool}),       # GET

        (r'/roles/?(\d+)?', RolesHandler, {'pool': pool}),       # GET

        (r'/permissions', PermissionsHandler, {'pool': pool}),       # GET

    ])

    tornado.platform.asyncio.AsyncIOMainLoop().install()
    app.listen(PORT, HOSTNAME)

    tornado.autoreload.add_reload_hook(
        lambda: print("Reloading webserver.")
    )
    tornado.autoreload.start()

    print("Server started on http://{}:{}".format(HOSTNAME, PORT))


if __name__ == '__main__':
    asyncio.async(init_database(DSN)) \
           .add_done_callback(start_server)

    asyncio.get_event_loop().run_forever()
