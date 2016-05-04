
var express = require('express');
var proxy = require('express-http-proxy');
var _ = require('lodash');
var atob = require('atob');


const BASE = 'http://pms.zaphod', API_ROOT = '/';
// const BASE = 'https://pms.wlbd.nl', API_ROOT = '/';
// const BASE = 'http://localhost:4242', API_ROOT = '/api';

var app = express();
app.use(API_ROOT, proxy(BASE));

/**
 * Testing the PMS API
 *
 * Usage:  mocha example/index.js
 */

var SwaggerParser = require('swagger-parser')
var parser = new SwaggerParser()
var hippieSwagger = require('hippie-swagger')
var hippie = require('hippie')
var expect = require('chai').expect
var path = require('path')
var dereferencedSwagger


function parseBody(res) {
  return JSON.parse(res.body);
}

class Session {
  // Keeps track of a session
  // Exposes the api, either against swagger or not.
  static swagger = hippieSwagger(app, dereferencedSwagger);
  static hippie  = hippie(app);

  // Api Session singleton... 
  function API() {

    // Add all the headers
    if (api.token) {
      h = h.header('Authorization', api.token);
    }

    return h;
  }

  post(url, body, expectedStatus) {
    return this.swagger()
      .post(url)
      .send(body)
      .expectStatus(expectedStatus)
      .end();
  }

  get(url, expectedStatus) {
    return this.swagger()
      .get(url)
      .expectStatus(expectedStatus)
      .end();
  }

  put(url, body, expectedStatus) {
    return this.swagger()
      .put(url)
      .send(body)
      .expectStatus(expectedStatus)
      .end();
  }

  login(auth, expectedStatus) {
      return this.post('/api/login', auth, expectedStatus)
                .then(parseBody)
  } 
}

function getError(body) {
  // Currently the body an error responds with contains a string with data. 
  // parse that
  expect(body.error).to.be.a('string');
  try {
    var json = JSON.parse(body.error);
    expect(json.error).to.be.a('string');
    return json.error
  } catch (e) {
    return body.error
  }
}

function baseAPIResource(resource, session) {
  // test the API for basic functionalities.

  // Configure some utility functions on the session
  const simpleHippie = function() {
    return hippie(app)
    .json()
    .header('Authorization', session.token)
  }
  const swaggerHippie = function () {
  }

  function getPermissions() {
    // Returns permissions based on the resource, and session properties.

    // fetch the resources permissions
    return _.get(session.permissions, resource, {});
  }

  describe('get /' + resource, function () {
    var fetched;
    it('should return resources', function () {
      return session()
      .get('/api/' + resource)
      .expectStatus(200)
      .end()
      .then(function (res) {
        fetched = JSON.parse(res.body);
      })
    })
    
    it('should only contain viewable fields', function () {
      var resourcePermissions = getPermissions();
      _.each(_.get(fetched, resource), function (item) {

        if (resourcePermissions.self && (item.id === session.user_id)) {
          expect(
            _.difference(
              _.keys(item),
              _.uniq(_.concat(resourcePermissions.self.view, resourcePermissions.view))
            )
          ).to.be.empty; 
        } else {
          expect(
            _.difference(
              _.keys(item),
              resourcePermissions.view
            )
          ).to.be.empty; 
        }

      })
    })

    it('a single item', function () {
      // Find a valid resource id from the fetched data
      var resourceId = _.head(_.keys(_.get(fetched, resource)));
      var resourceParam = resource + '_id';

      return session()
      .get('/api/' + resource + '/{' + resourceParam + '}')
      .pathParams({
        [resourceParam]: _.toInteger(resourceId)
      })
      .expectStatus(200)
      .end()
    });
  })

  describe('post /' + resource, function () {
    it('can not add empty data', function (done) {
      // test with plain hippie
      simpleHippie()
      .post('/api/' + resource)
      .send({})
      .expectStatus(400)
      .expect(function (res, body, next) {
        // Error depends on permissions
        if (_.has(session.permissions, [resource, 'create'])) {
          expect(getError(body)).to.equal('Creating nothing is not allowed')
        } else {
          expect(getError(body)).to.equal('Creating "' + resource + '" not allowed')
        }
        // No need to call next
        next()
      })
      .end(done)
    })
  })


  describe('put /' + resource, function () {
    it('can update using correct gid', function (done) {
      done();
    });
    it('can not update without gid');
    it('can not update with incorrect gid');
    it('can not write field without permissions');
  })

  describe('delete', function () {
    it('can delete resources');
  })
}

// Start of actual tests

describe('Using pms', function () {
  before(function (done) {
    // if using mocha, dereferencing can be performed prior during initialization via the delay flag:
    // https://mochajs.org/#delayed-root-suite
    parser.dereference(path.join(__dirname, '../swagger.yaml'), function (err, api) {
      if (err) return done(err)
      dereferencedSwagger = api
      done()
    })
  })


  describe('as board', function () {
    var session = api();

    it('can login', function () {
      return session.login({
          'user': 'sammy@example.com',
          'password': '1234'
        }, 200)
        .then(function (body) {
          expect(body.token).to.be.a('string')
          expect(body.permissions).to.be.an('object')
          session.token = body.token;
          session.permissions = body.permissions;

          session.user_id = JSON.parse(
            atob(
              body.token
                  .split('.')[1]
                  .replace(/-/g, '+')
                  .replace(/_/g, '/')
            )
          ).user;
        })
    })

    describe('on people:', function () {
      baseAPIResource('people', session)
    })

    describe('on roles', function () {
      baseAPIResource('roles', session)
    })

    // describe('on fields', function () {
    //   baseAPIResource('fields', session)
    // })

  })

  describe('as member', function () {
    var session = api();

    it('can login', function () {
      return session()
        .post('/api/login')
        .send({
          'user': 'wikkert@example.com',
          'password': '1234'
        })
        .expectStatus(200)
        .end()
        .then(function (res) {
          var data = JSON.parse(res.body)

          session.token = data.token;
          session.permissions = data.permissions;

          session.user_id = JSON.parse(
            atob(
              data.token
                  .split('.')[1]
                  .replace(/-/g, '+')
                  .replace(/_/g, '/')
            )
          ).user;
        })
    })

    describe('on people:', function () {
      baseAPIResource('people', session)
    })

    describe('on roles', function () {
      baseAPIResource('roles', session)
    })

    // describe('on fields', function () {
    //   baseAPIResource('fields', session)
    // })
  })

  describe('unauthorized', function () {
    session = api()


    it('can not login.', function () {
      return session.login({
        'user': 'wikkert@example.com',
        'password': '1234s'
      }, 400)
      .then(function (data) {
        session.token = data.token;
        session.permissions = data.permissions;
      })
    })
    it('can not login with null password', function () {
      return session.login({
        'user': 'wikkert@example.com', 
        'password': null
      }, 400)
    })

    it('should not get people without authorization.', function (done) {
      return session.get('api/people', 400)
      .then(parseBody)
      .then(getError)
      .then(function (err) {
        expect(err).to.equal('No Authorization header found')
        done()
      })
    })

    it('should not get roles without authorization.', function (done) {
      return session.get('api/roles', 400)
      .then(parseBody)
      .then(getError)
      .then(function (err) {
        expect(err).to.equal('No Authorization header found')
        done()
      })
    })

    it('should not get fields without authorization.', function (done) {
      return session.get('api/fields', 400)
      .then(parseBody)
      .then(getError)
      .then(function (err) {
        expect(err).to.equal('No Authorization header found')
        done()
      })
    })
  })
})