import React from 'react';
import { Map, List } from 'immutable';
import _ from 'lodash';
import { memoizeMethod } from './util';

// Components
import { ItemEdit } from 'components';


const splitCase = (str) => str.replace(/([a-z0-9])([A-Z])/, '$1 $2').toLowerCase().split(' ');

export default class BaseResource {
  // Resources contain all logic regarding the api workflows and managing state
  // In order to have the frontend reflect any changes that will happen when data
  // is persisted to the backend.

  @memoizeMethod
  static setState(state) {
    // return a resource object representing state.

    // merge each item with updates.
    return new this(state);
  }

  constructor(state) {
    this.loaded = state.get('loaded');
    this.fetching = state.get('fetching');
    this.pushing = state.get('pushing');
    this.items = state.get('items')
                      .mergeWith(
                        (prev, next) => (List.isList(prev) ? next : undefined),
                        state.get('updates', Map())
                      );
  }

  get resourceSlug() {
    // Returns the slug on which the resource is identified
    return _.head(splitCase(this.constructor.name));
  }

  setResources(resources) {
    this.resources = resources;

    const fields = this.resources.fields;
    if (fields.loaded) {
      // Fetch the schema info out of the fields resource.
      this.schema = fields.getSchema(this.resourceSlug);
    }
  }

  getResources() {
    return _.chain(this.schema.properties)
        .filter(_.matches({ type: 'reference' }))
        .keyBy((property) => property.target)
        .mapValues((property) => _.get(this.resources, property.target))
        .value();
  }

  setDispatch(dispatch) {
    // Bind dispatch to the constructor's actions, and set them on the resource
    this.actions = _.mapValues(
      this.constructor.actions,
      (action) => _.flow(action, dispatch)
    );

    this.checkState();
  }

  setAuth(auth) {
    this.auth = auth;
  }

  checkState() {
    // !!! Should have a populated state and dispatch function
    // Check whether we should trigger a fetch from the api.

    if (!(this.loaded || this.fetching)) {
      // Trigger fetch
      this.actions.fetch();
    }
  }

  get(id, notSetValue) {
    return this.items.get(_.toString(id), notSetValue).toJS();
  }

  // Utility functions which return normal js objects
  all() {
    return this.items.toJS();
  }
  find(...args) {
    const result = this.items.find(...args);
    return result ? result.toJS() : undefined;
  }
  filter(...args) {
    const result = this.items.filter(...args);
    return result ? result.toJS() : undefined;
  }
  map(...args) {
    const result = this.items.map(...args);
    return result ? result.toJS() : undefined;
  }

  // Component renderers
  renderItemEdit(person) {
    // const permissions = (parseInt(personId, 10) === auth.user.user)
    //   ? _.merge({}, auth.permissions.people.self, auth.permissions.people)
    //   : auth.permissions.people;

    // // Generate references from updates in resources.
    // // This is needed due to ref updates (trough the references field)
    // // not creating the reverse ref. This function generates those
    // const reverseRefs = schemaUtil.generateReverseRefs('people', person, resources, fields);

    // console.log(reverseRefs);

    return (
      <ItemEdit
        type={this.resourceSlug}
        schema={this.schema}
        resources={this.getResources()}
        item={person}
        auth={this.auth.toJS()}
        onChange={(value, key) => this.actions.update(person.id, value, key) }
      />
    );
  }
}
