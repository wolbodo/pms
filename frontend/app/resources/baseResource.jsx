
import { Map, List } from 'immutable';
import _ from 'lodash';
import { memoizeMethod } from './util';

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

  setDispatch(dispatch) {
    // Bind dispatch to the constructor's actions, and set them on the resource
    this.actions = _.mapValues(
      this.constructor.actions,
      (action) => _.flow(action, dispatch)
    );

    this.checkState();
  }

  checkState() {
    // !!! Should have a populated state and dispatch function
    // Check whether we should trigger a fetch from the api.

    if (!(this.loaded || this.fetching)) {
      // Trigger fetch
      this.actions.fetch();
    }
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
}
