const faker = require('faker');
const express = require('express');
const proxy = require('express-http-proxy');
const _ = require('lodash');
const atob = require('atob');

const hippieSwagger = require('hippie-swagger')
const hippie = require('hippie')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const path = require('path')

chai.use(chaiAsPromised)

const expect = chai.expect
const should = chai.should()

const SwaggerParser = require('swagger-parser')
const parser = new SwaggerParser()

var dereferencedSwagger


// const BASE = 'http://pms.zaphod', API_ROOT = '/';
// const BASE = 'https://pms.wlbd.nl', API_ROOT = '/';
const BASE = 'http://localhost:4242', API_ROOT = '/api';

var app = express();
app.use(API_ROOT, proxy(BASE));

faker.locale = 'nl';

/**
 * Testing the PMS API
 *
 * Usage:  mocha example/index.js
 */


class Session {

  authorized(hippie) {
    return (this.token) ? hippie.header('Authorization', this.token)
                        : hippie;
  }

  swagger() {
    // Returns hippie-swagger, tests validity against swagger

    return this.authorized(
      hippieSwagger(app, dereferencedSwagger)
      .json()
    )
  }
  hippie() {
    // Returns hippie-swagger, tests validity against swagger

    return this.authorized(
      hippie(app)
      .json()
    )
  }

  getPermissions(resource) {
    // Returns permissions based on the resource, and session properties.

    // fetch the resources permissions
    return _.get(this.permissions, resource, {});
  }


  getError(body) {
    var err = body.error

    try {
      err = JSON.parse(err)
      return err.error;
    } catch (e) {
      return err;
    }
  }
  parse(resp) {
    return JSON.parse(resp.body)
  }

  parseLoginResponse(body) {
    this.token = body.token;
    this.permissions = body.permissions;
    this.user_id = JSON.parse(
      atob(
        body.token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
      )
    ).user;
  }

  login(user, password) {
    return this.swagger()
      .post('/api/login')
      .send({user, password})
      .expectStatus(200)
      .end()
      .then(this.parse)
      .then((body) => this.parseLoginResponse(body))
  }
}

function generateRandomResource(resource, permissions) {
  // Generates a random resource from it's schema

  // Fetch the generator map
  var random = _.get(generateRandomResource, `defaultMap.${resource}`, {})

  return _.chain(permissions.edit)    // For every editable property on the resource
    .filter(_.partial(_.has, random)) // Only properties in defaultsMap
    .keyBy()                          // Construct an object
    .mapValues(property =>            // Assing a random value
      random[property]()
    )
    .value()
}
generateRandomResource.defaultMap = {
  people: {
    birthdate: () => new Date(faker.date.past(30, '01-01-1990'))
                          .toISOString()
                          .slice(0,10),
    city: faker.address.city,
    country: faker.address.country,
    email: faker.internet.email,
    emergencyinfo: faker.lorem.sentence,
    firstname: faker.name.firstName,
    frontdoor: faker.random.boolean,
    functions: () => faker.random.words().split(' '),
    housenumber: faker.random.number,
    lastname: faker.name.lastName,
    mobile: faker.phone.phoneNumber,
    nickname: faker.internet.userName,
    phone: faker.phone.phoneNumber,
    state: faker.address.state,
    street: faker.address.streetName,
    zipcode: faker.address.zipCode,
  },
  roles: {
    name: () => faker.commerce.department().toLowerCase(),
    description: faker.lorem.sentence
  }
}

function error(message) {
  // Returns a function which can be fed into an hippie expect call.

  return (res, body, next) => {
    expect(body.error).to.equal(message)
    next()
  }
}

function baseAPIResource(resource, session) {
  // test the API for basic functionalities.
  var schema;

  describe('Fetching resource schema', function () {
    it('Should return a schema', function () {
      return session.swagger()
        .get('/api/fields/{resource_name}')
        .pathParams({
          resource_name: resource
        })
        .expectStatus(200)
        .expect((res, body, next) => {
          expect(body).to.have.deep.property(`fields.${resource}`)
                      .that.is.an('object')
                      .and.is.not.empty
          next()
        })
        .end()
        .then(session.parse)
        .then((data) => { schema = data; })
    })
  })

  describe(`GET /${resource}`, function () {
    var fetched;
    it('should return resources', function () {
      return session.swagger()
      .get(`/api/${resource}`)
      .expectStatus(200)
      .end()
      .then(session.parse)
      .then((data) => { fetched = data; })
    })
    
    it('should only contain viewable fields', function () {
      var resourcePermissions = session.getPermissions(resource);

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

    it('returns a single item', function () {
      // Find a valid resource id from the fetched data
      var resourceId = _.head(_.keys(_.get(fetched, resource)));

      return session.swagger()
      .get(`/api/${resource}/{${resource}_id}`)
      .pathParams({
        [`${resource}_id`]: _.toInteger(resourceId)
      })
      .expectStatus(200)
      .end()
      .then(session.parse)
      .should.eventually.satisfy((data) => {
        return _.has(data, resource) && _.keys(_.get(data, resource)).length === 1 
      })
    });
  })

  describe(`POST /${resource}`, function () {
    it('can not add empty data', function () {
      // test with plain hippie
      return session.hippie()
      .post(`/api/${resource}`)
      .send({})
      .expectStatus(400)
      .end()
      .then(session.parse)
      .then(session.getError)
      .then((error) => {
        if (_.has(session.permissions, [resource, 'create'])) {
          // When the user has create permissions.
          // It should warn about creating nothing
          expect(error).to.equal('Creating nothing is not allowed')
        } else {
          // When it has no permissions,
          // It should warn about not allowing creating.
          expect(error).to.equal(`Creating "${resource}" not allowed`)
        }
      })
    })

    it('can add a new object with permissions', function () {
      const permissions = session.getPermissions(resource)
      const sample = generateRandomResource(resource, permissions)

      if (!_.isEmpty(sample)) {
        return session.swagger()
        .post(`/api/${resource}`)
        .send(sample)
        .expectStatus(200)
        .end()
      } else {
        if (permissions.create) {
          return expect(permissions.edit).to.be.empty
        }
      }
    })
    it('cannot add unwritable fields')
  })

  describe(`PUT /${resource}`, function () {
    it('can update using correct gid');
    it('can not update without gid');
    it('can not update with incorrect gid');
    it('can not write field without permissions');
  })

  describe(`DELETE /${resource}`, function () {
    it('can delete resources');
  })
}

// Start of actual tests

function testUser(user, password) {
  const session = new Session()

  // TODO:, login to fetch permissions
  // Delay the calls to the returned functions until promise resolves.

  return function () {
    it('can login', () => session.login(user, password))

    describe('on people:', function () {
      baseAPIResource('people', session)
    })

    describe('on roles', function () {
      baseAPIResource('roles', session)
    })
  }
    // describe('on fields', function () {
    //   baseAPIResource('fields', session)
    // })
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

  describe('as board', testUser('sammy@wlbd.nl', '1234'))

  describe('as member', testUser('dexter@wlbd.nl', '1234'))

  describe('as admin', testUser('dexter+admin@wlbd.nl', '1234'))

  describe('unauthorized', function () {
    const session = new Session()

    it('can not login.', function () {
      return session.swagger()
        .post('/api/login')
        .send({'user': 'dexter@wlbd.nl', 'password': '1234s'})
        .expectStatus(400)
        .end()
    })
    it('can not login with null password', function () {
      return session.hippie()
        .post('/api/login')
        .send({'user': 'dexter@wlbd.nl', 'password': null})
        .expectStatus(400)
        .end()
    })

    it('should not get people without authorization.', function () {
      return session.swagger()
        .get('/api/people')
        .expectStatus(400)
        .expect(error('No Authorization header found'))
        .end()
    })

    it('should not get roles without authorization.', function () {
      return session.swagger()
        .get('/api/roles')
        .expectStatus(400)
        .expect(error('No Authorization header found'))
        .end()
    })

    it('should not get fields without authorization.', function () {
      return session.swagger()
        .get('/api/fields')
        .expectStatus(400)
        .expect(error('No Authorization header found'))
        .end()
    })
  })
})