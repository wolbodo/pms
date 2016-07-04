import React from 'react';
import { Map, List } from 'immutable';
import _ from 'lodash';
import { memoizeMethod } from './util';

// Components
import { ItemEdit } from 'components';


const splitCase = (str) => str.replace(/([a-z0-9])([A-Z])/, '$1 $2').toLowerCase().split(' ');

class Reference {
  // Keeps a reference between resources, manages updates for references in resources.
  static _resourceMappings = {}
  static getReferenceFor(...resources) {
    // returns a new reference for linking resources.
    // Only creates new references for new resources.

    // NEED to order resources here.
    const referenceId = _.join(_.sortBy(
      _.map(resources, (res) => res.resourceSlug)
    ), '_');
    let reference = _.get(Reference._resourceMappings, referenceId);
    if (!reference) {
      reference = new Reference(referenceId, ...resources);
      Reference._resourceMappings[referenceId] = reference;
    }
    return reference;
  }

  constructor(referenceId, ...resources) {
    this.resources = _.keyBy(resources, (resource) => resource.resourceSlug);
    this.id = referenceId;
    this.descriptions = {};
    // this.references = {};
  }

  setDescription(resource, description) {
    // sets a description for a resource.
    console.log(':: setDescription', resource, description);
    this.descriptions[resource.resourceSlug] = description;

    if (!_.eq(this.resources[resource.resourceSlug], resource)) {
      console.log('-> Description changed');
      this.resources[resource.resourceSlug] = resource;
    }

    // if (resource.loaded) {
    //   // Store the reference mappings
    //   const desc = _.get(this.descriptions, resource.resourceSlug);
    //   this.references[resource.resourceSlug] = resource._items.map(
    //     (item) => item.get(desc.key)
    //                   .map((ref) =>
    //                     _.parseInt(_.replace(ref.get('$ref'), `/${desc.target}/`, ''))
    //                   )
    //   ).toJS();
    // }
  }

  generateField(fieldName, itemId, currentValue) {
    console.log(':: generateField', fieldName, itemId, currentValue);
    // console.log(fieldName, itemId, currentValue);
    const description = _.find(this.descriptions, _.matches({ key: fieldName }));
    const otherDesc = _.get(this.descriptions, description.target);
    const updates = _.get(this, [
      'resources',
      description.target,
      '_updates'
    ]);

    // Find updates in referenced resource. and merge them
    const itemUpdates = updates.filter(
                          (value) => value.get(otherDesc.key)
                                          .includes(Map({ $ref: `/roles/${itemId}` }))
                        )
                        .map((value, key) => Map({
                          $ref: `/${description.target}/${key}`
                        })).toList();

    if (itemUpdates && !itemUpdates.isEmpty()) {
      // console.log(fieldName, itemId, currentValue, itemUpdates);
      // reverse itemUpdates, to be merged with currentValue
      return currentValue.concat(itemUpdates);
    }
    return currentValue;
  }

  createPropertyGetter(key, itemId) {
    return () => {
      console.log('getting', this, key, itemId, this);
      debugger;
    };
  }

  update(itemId, value, key) {
    console.log(':: update', itemId, value, key);
    debugger;
  }
}

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
    this._updates = state.get('updates', Map());
    this._items = state.get('items')
                      .mergeWith(
                        (prev, next) => (List.isList(prev) ? next : prev.merge(next)),
                        this._updates
                      );

    // For keeping a mapping between fields and references.
    this._references = {};
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

  get size() {
    return this._items.size;
  }

  get refProperties() {
    return _.chain(this.schema.properties)
            .map((property, key) => ({ ...property, key })) // Zip the key in
            .filter(_.matches({ type: 'reference' }))
            .value();
  }
  getResources() {
    return _.chain(this.refProperties)
        .keyBy((property) => property.target)
        .mapValues((property) => _.get(this.resources, property.target))
        .value();
  }

  setResources(resources) {
    this.resources = resources;

    const fields = this.resources.fields;
    if (fields.loaded) {
      // Fetch the schema info out of the fields resource.
      this.schema = fields.getSchema(this.resourceSlug);

      // Link referenced resources.
      _.chain(this.refProperties)
       .keyBy((refProp) => refProp.key)
       .map((refProp) => this.linkReference(resources[refProp.target], refProp))
       .value();
    }
  }

  linkReference(resource, description) {
    const reference = Reference.getReferenceFor(this, resource);
    // set the referecense
    // WAS WORKING HERE, references need to be stored on
    reference.setDescription(this, description);
    this.setReference(description.key, reference);
  }
  setReference(key, reference) {
    this._references[key] = reference;
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

  wrapReferencedResource(item) {
    item.merge(
      _.chain(this._references)
       .mapValues((ref, key) => ref.createPropertyGetter(key, item.get('id')))
       .value()
    );

    return _.merge(
      item.toJS(),
      _.chain(this._references)
       .mapValues((ref, key) => ref.createPropertyGetter(key, item.get('id')))
       .value()
    );
  }
  wrap() {
    // return a js list of objects with getters
    return this._items.map(this.wrapReferencedResource.bind(this));
  }

  get(id, notSetValue) {
    const result = this.wrap().get(_.toString(id));
    return result || notSetValue;
  }

  /*
   * Utility functions which return normal js objects
   */
  all() {
    return this.wrap().toJS();
  }
  find(...args) {
    const result = this.wrap().find(...args);
    return result;
  }
  filter(...args) {
    const result = this.wrap().filter(...args);
    return result ? result.toList().toJS() : undefined;
  }
  map(...args) {
    const result = this.wrap().map(...args);
    return result ? result.toList().toJS() : undefined;
  }

  /*
   * Permission functions
   */
  getPermissionsFor(resourceId) {
    if (this._permissions.has('self') && (this._auth.getIn(['user', 'user']) === resourceId)) {
      // Check whether resourceId is equal to auth.user.user
      return this._permissions
        .mergeWith(
          (prev, next) => (List.isList(prev) ? prev.concat(next) : prev.merge(next)),
          this._permissions.get('self')
        )
        .delete('self')
        .toJS();
      // return this._permissions.merge(this._permissions.get('self')).delete('self').toJS();
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

    // When the key is a referencedResource, update it trough the reference;
    if (_.has(this._references, key)) {
      const reference = _.get(this._references, key);
      reference.update(itemId, value, key);
    } else {
      // Check whether it has changed
      if (!_.eq(item[key], value)) {
        this.actions.update(itemId, value, key);
      }
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
