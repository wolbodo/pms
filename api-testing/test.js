
var express = require('express');
var proxy = require('express-http-proxy');
var _ = require('lodash');
var atob = require('atob');


var app = express();
// app.use('/', proxy('https://pms.wlbd.nl'));
app.use('/', proxy('pms.zaphod'));

/**
 * Testing the PMS API
 *
 * Usage:  mocha example/index.js
 */

var SwaggerParser = require('swagger-parser')
var parser = new SwaggerParser()
var hippie = require('hippie-swagger')
var expect = require('chai').expect
var path = require('path')
var dereferencedSwagger

function api() {
  // Wrap api to allow for sessions
  var headers = {};

  function api() {
    var h = hippie(app, dereferencedSwagger);
    // Add all the headers

    if (api.token) {
      h = h.header('Authorization', api.token);
    }

    return h;
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

  describe('get', function () {
    var fetched;
    it('works', function () {
      return session()
      .get('/api/' + resource)
      .expectStatus(200)
      .end()
      .then(function (res) {
        fetched = JSON.parse(res.body);
      })
    })
    
    it('should only contain viewable fields', function () {
      var resourcePermissions = _.get(session.permissions, [resource]);
      _.each(_.get(fetched, resource), function (item, id) {

        if (resourcePermissions.self && (_.toInteger(id) === session.user_id)) {
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
      session()
      .post('/api/' + resource)
      .send({})
      .expectStatus(400)
      .end(function (err, resp, body) {

        // Error depends on permissions
        if (_.has(session.permissions, [resource, 'create'])) {
          expect(getError(body)).to.equal('Creating nothing is not allowed')
        } else {
          expect(getError(body)).to.equal('Creating "' + resource + '" not allowed')
        }
        done(err, resp, body)
      })
    })
  })


  describe('put', function () {
    it('can update using correct gid');
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
      return session()
        .post('/api/login')
        .send({
          'user': 'sammy@example.com',
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
      return session()
      .post('/api/login')
      .send({
          'user': 'wikkert@example.com',
          'password': '1234s'
      })
      .expectStatus(400)
      .end()
      .then(function (res) {
        var data = JSON.parse(res.body)

        session.token = data.token;
        session.permissions = data.permissions;
      })
    })

    it('should not get people without authorization.', function (done) {
      session()
      .get('/api/people')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })

    it('should not get roles without authorization.', function (done) {
      session()
      .get('/api/roles')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })

    it('should not get fields without authorization.', function (done) {
      session()
      .get('/api/fields')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })
  })
})