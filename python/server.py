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


class DatabaseHandler(tornado.web.RequestHandler):
    @coroutine
    async def initialize(self, pool):
        self.pool = pool


    def write_error(self, status_code, **kwargs):
        self.set_status(status_code);
        self.write({
            'error': str(kwargs['exc_info'][1])
        })
        

class LoginHandler(DatabaseHandler):
    @coroutine
    async def post(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Login
                await cur.execute("SELECT login(emailaddress := %(user)s, password := %(password)s);",
                                  json.loads(self.request.body.decode('utf-8'))
                                  )
                token = await cur.fetchone()

                # Get permissions
                await cur.execute("SELECT (permissions_get(token := %(token)s)).permissions;", {
                    'token': token[0]
                })
                permissions = await cur.fetchone()

                self.write({
                    'token': token[0],
                    'permissions': permissions[0]
                })


class FieldsHandler(DatabaseHandler):
    @coroutine
    async def get(self, table=None):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT fields_get(token := %(token)s, ref_table := %(table)s);", {
                    'token': self.request.headers['Authorization'],
                    'table': table
                })
                row = await cur.fetchone()
                self.set_header('Content-Type', 'application/json')
                self.write(row[0])


class RolesHandler(DatabaseHandler):
    @coroutine
    async def get(self, roles_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT roles_get(token := %(token)s, roles_id := %(roles_id)s);", {
                    'token': self.request.headers['Authorization'],
                    'roles_id': roles_id or -1
                })
                row = await cur.fetchone()
                self.set_header('Content-Type', 'application/json')
                self.write(row[0])


class PermissionsHandler(DatabaseHandler):
    @coroutine
    async def get(self):
        """Returns the self-permissions for now. Should return all permissions"""
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT (permissions_get(token := %(token)s)).permissions;", {
                    'token': self.request.headers['Authorization']
                })
                row = await cur.fetchone()
                self.write(row[0])


class PeopleHandler(DatabaseHandler):
    @coroutine
    async def get(self, people_id=-1):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT people_get(token := %(token)s, people_id := %(people_id)s);", {
                    'token': self.request.headers['Authorization'],
                    'people_id': people_id
                })
                row = await cur.fetchone()
                self.set_header('Content-Type', 'application/json')

                self.write(row[0])

    @coroutine
    async def put(self, people_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT people_set(token := %(token)s, people_id := %(people_id)s, data := %(body)s);", {
                    'token': self.request.headers['Authorization'],
                    'people_id': people_id,
                    'body': self.request.body.decode('utf-8')
                })
                row = await cur.fetchone()
                self.write(row[0])

    @coroutine
    async def post(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT people_add(token := %(token)s, data := %(body)s);", {
                    'token': self.request.headers['Authorization'],
                    'body': self.request.body.decode('utf-8')
                })
                row = await cur.fetchone()
                self.write(row[0])


async def init_database(dsn):
    global pool

    pool = await aiopg.create_pool(dsn)


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
