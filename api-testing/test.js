
var express = require('express');
var proxy = require('express-http-proxy');


var app = express();
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

function api(authorization) {
  return hippie(app, dereferencedSwagger)
    .header('Authorization', authorization)
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
    var authorization;

    it('can login.', function (done) {
      api()
      .post('/api/login')
      .send({
          'user': 'sammy@example.com',
          'password': '1234'
      })
      .expectStatus(200)
      .end(function (err, resp, body) {
        authorization = body.token;
        done(err, resp, body);
      })
    })

    it('can fetch people', function (done) {
      api(authorization)
      .get('/api/people')
      .expectStatus(200)
      .end(done)
    })

    it('can fetch roles', function (done) {
      api(authorization)
      .get('/api/roles')
      .expectStatus(200)
      .end(done)
    })

    it('can fetch fields', function (done) {
      api(authorization)
      .get('/api/roles')
      .expectStatus(200)
      .end(done)
    })
  })

  describe('as member', function () {
    var authorization;

    it('can login.', function (done) {
      api()
      .post('/api/login')
      .send({
          'user': 'wikkert@example.com',
          'password': '1234'
      })
      .expectStatus(200)
      .end(function (err, resp, body) {
        authorization = body.token;
        done(err, resp, body);
      })
    })

    it('can fetch people', function (done) {
      api(authorization)
      .get('/api/people')
      .expectStatus(200)
      .end(done)
    })

    it('can fetch roles', function (done) {
      api(authorization)
      .get('/api/roles')
      .expectStatus(200)
      .end(done)
    })

    it('can fetch fields', function (done) {
      api(authorization)
      .get('/api/roles')
      .expectStatus(200)
      .end(done)
    })
  })

  describe('unauthorized', function () {
    it('can not login.', function (done) {
      api()
      .post('/api/login')
      .send({
          'user': 'wikkert@example.com',
          'password': '1234s'
      })
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('Username or password wrong')
        done(err, resp, body);
      })
    })

    it('should not get people without authorization.', function (done) {
      api()
      .get('/api/people')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })

    it('should not get roles without authorization.', function (done) {
      api()
      .get('/api/roles')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })

    it('should not get fields without authorization.', function (done) {
      api()
      .get('/api/fields')
      .expectStatus(400)
      .end(function (err, resp, body) {
        expect(getError(body)).to.equal('No Authorization header found')
        done(err, resp, body);
      })
    })

  })


  // describe('things hippie-swagger will punish you for:', function () {
  //   it('validates paths', function (done) {
  //     try {
  //       hippie(app, dereferencedSwagger)
  //         .get('/api/undocumented-endpoint')
  //         .end()
  //     } catch (ex) {
  //       expect(ex.message).to.equal('Swagger spec does not define path: /undocumented-endpoint')
  //       done()
  //     }
  //   })

  //   it('validates parameters', function (done) {
  //     try {
  //       hippie(app, dereferencedSwagger)
  //         .get('/tags/{tagId}')
  //         .qs({ username: 'not-in-swagger' })
  //         .end()
  //     } catch (ex) {
  //       expect(ex.message).to.equal('query parameter not mentioned in swagger spec: \"username\", available params: tagId')
  //       done()
  //     }
  //   })

  //   it('validates responses', function (done) {
  //     hippie(app, dereferencedSwagger)
  //       .get('/tags/invalidResponse')
  //       .end(function (err) {
  //         expect(err.message).to.match(/Response failed validation/)
  //         done()
  //       })
  //   })

    // it('validates many other things!  See README for the complete list of validations.')
  // })
})