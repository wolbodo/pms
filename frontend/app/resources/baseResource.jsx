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
  static setDispatch(dispatch) {
    this._actions = _.mapValues(
      this.actions,
      (action) => _.flow(action, dispatch)
    );
  }

  constructor(state) {
    this.loaded = state.get('loaded');
    this.fetching = state.get('fetching');
    this.pushing = state.get('pushing');
    this._items = state.get('items')
                      .mergeWith(
                        (prev, next) => (List.isList(prev) ? next : prev.merge(next)),
                        state.get('updates', Map())
                      );
  }

  get resourceSlug() {
    // Returns the slug on which the resource is identified
    return _.head(splitCase(this.constructor.name));
  }

  get actions() {
    // Bind dispatch to the constructor's actions, and set them on the resource
    if (_.has(this.constructor, '_actions')) {
      return this.constructor._actions;
    }
    throw new Error('No actions loaded (dispatch not attached to resource');
    // return undefined;
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

  setAuth(auth) {
    this._permissions = auth.getIn(['permissions', this.resourceSlug], Map());
    this._auth = auth;
  }

  checkState() {
    // !!! Should have a populated state and dispatch function
    // Check whether we should trigger a fetch from the api.

    if (this.actions && !(this.loaded || this.fetching)) {
      // Trigger fetch
      this.actions.fetch();
    }
  }

  get(id, notSetValue) {
    const result = this._items.get(_.toString(id));
    return result ? result.toJS() : notSetValue;
  }

  /*
   * Utility functions which return normal js objects
   */
  all() {
    return this._items.toJS();
  }
  find(...args) {
    const result = this._items.find(...args);
    return result ? result.toJS() : undefined;
  }
  filter(...args) {
    const result = this._items.filter(...args);
    return result ? result.toJS() : undefined;
  }
  map(...args) {
    const result = this._items.map(...args);
    return result ? result.toJS() : undefined;
  }

  /*
   * Permission functions
   */
  getPermissionsFor(resourceId) {
    if (this._permissions.has('self') && (this._auth.getIn(['user', 'user']) === resourceId)) {
      // Check whether resourceId is equal to auth.user.user
      return this._permissions.merge(this._permissions.get('self')).delete('self').toJS();
    }
    return this._permissions.toJS();
  }

  getSchemaForField(field) {
    return _.get(this.schema, ['properties', field]);
  }

  getPermissionsForField(resourceId, field) {
    const permissions = this.getPermissionsFor(resourceId);
    const fieldSchema = this.getSchemaForField(field);

    if (_.get(fieldSchema, 'type') === 'reference') {
      // Figure out permissions due to indirect permissions

      const referenceTable = _.join(_.sortBy([fieldSchema.target, this.resourceSlug]), '_');

      // Map create permissions on the specific resourceId.
      // if any properties defined on permissions.create, check on which type it is mapped.
      const refPermissions = this._auth.getIn(['permissions', referenceTable, 'create']);

      // Figure out the filtering.
      const currentResource = `${this.resourceSlug}_id`;
      const targetResource = `${fieldSchema.target}_id`;

      if (_.has(refPermissions, currentResource)) {
        // The current resource is being filtered by some ids.

        // Permissions for this resource?
        if (_.includes(refPermissions[currentResource], resourceId)) {
          return {
            edit: true
          };
        }
        // Else
        return {}; // No permissions
      } else if (_.has(refPermissions, targetResource)) {
        // permissions are being filtered by the refPermissions on target resource
        return {
          edit: true,
          filter: _.get(refPermissions, targetResource)
        };
      }

      return {
        edit: !!refPermissions
      };
    }
    return {
      edit: _.includes(permissions.edit, field),
      view: _.includes(permissions.view, field),
    };
  }

  getReferencedResource(field) {
    const fieldSchema = this.getSchemaForField(field);

    return _.get(this.resources, fieldSchema.target);
  }

  /*
   * Crud functions
   */
  updateItem(itemId, value, key) {
    // Sets key/value on item.

    const item = this.get(itemId);
    // Check whether it has changed
    if (!_.eq(item[key], value)) {
      this.actions.update(itemId, value, key);
    }
  }

  /*
   * Component renderers
   */
  renderItemEdit(item) {
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
        resource={this}
        item={item}
      />
    );
  }
}
