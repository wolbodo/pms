
var express = require('express');
var proxy = require('express-http-proxy');
var _ = require('lodash');
var atob = require('atob');


const BASE = 'http://pms.zaphod';
// app.use('/', proxy('https://pms.wlbd.nl'));
// app.use('/api', proxy('localhost:4242'));

var app = express();
app.use('/', proxy(BASE));

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

function api() {
  // Wrap api to allow for sessions
  var headers = {};

  // Api Session singleton... 
  function api() {
    var h = hippieSwagger(app, dereferencedSwagger);
    // Add all the headers

    if (api.token) {
      h = h.header('Authorization', api.token);
    }

    return h;
  }
  api.post = function post(url, body, expectedStatus) {
    return api()
      .post(url)
      .send(body)
      .expectStatus(expectedStatus)
      .end();
  }

  api.get = function get(url, expectedStatus) {
    return api()
      .get(url)
      .expectStatus(expectedStatus)
      .end();
  }

  api.put = function put(url, body, expectedStatus) {
    return api()
      .put(url)
      .send(body)
      .expectStatus(expectedStatus)
      .end();
  }

  api.login = function (auth, expectedStatus) {
      return api.post('/api/login', auth, expectedStatus)
                .then(parseBody)
  } 

  return api;
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

  function getPermissions() {
    // Returns permissions based on the resource, and session properties.

    // fetch the resources permissions
    return _.get(session.permissions, resource, {});
  }

  describe('get', function () {
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

  describe('post', function () {
    it('can not add empty data', function (done) {
      // test with plain hippie
      hippie()
      .json()
      .header('Authorization', session.token)
      .base(BASE)
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


  describe('put', function () {
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