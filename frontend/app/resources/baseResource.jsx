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
  }

  findUpdatedByRef(fieldName, itemId) {
    // Returns the updates in the backReference.
    const description = _.find(this.descriptions, _.matches({ key: fieldName }));
    const target = this.resources[description.target];
    const targetDesc = _.get(this.descriptions, description.target);

    return target._updates.filter(
            (value) =>
              value.get(targetDesc.key, List())
                   .some((ref) =>
                      ref.get('$ref') === `/${targetDesc.target}/${itemId}`
                   )
          )
          .map((value, key) => Map({
            $ref: `/${description.target}/${key}`
          })).toList();
  }
  findDeletedByRef(fieldName, itemId) {
    const description = _.find(this.descriptions, _.matches({ key: fieldName }));
    const target = this.resources[description.target];
    const targetDesc = _.get(this.descriptions, description.target);

    return target._updates.map(
              // All values in _items and not in _updates
              (update, updateId) =>
                // update should contain ref field
                update.has(targetDesc.key) &&
                target._items
                      .getIn([updateId, targetDesc.key])
                      // Filter out only refs referencing this item
                      .filter((ref) =>
                        ref.get('$ref') === `/${targetDesc.target}/${itemId}`
                      )
                      // Filter the ones not present in updates (was removed)
                      .filterNot((ref) =>
                        update.get(targetDesc.key, List())
                              .some((updateRef) => updateRef.get('$ref') === ref.get('$ref'))
                      )
    ).filterNot((i) => (!i) || i.isEmpty())
     .map((value, key) =>
        Map({
          $ref: `/${description.target}/${key}`
        })
      ).toList();
  }

  generateField(fieldName, itemId, currentValue) {
    // console.log(fieldName, itemId, currentValue);
    const resourceName = _.findKey(this.descriptions, _.matches({ key: fieldName }));
    const itemUpdates = this.resources[resourceName]._updates
                        .getIn([itemId.toString(), fieldName]);

    // Find updates in referenced resource. and merge them
    const updatesByRef = this.findUpdatedByRef(fieldName, itemId);

    const deletedByRef = this.findDeletedByRef(fieldName, itemId);

    const value = itemUpdates ? itemUpdates.toJS() : currentValue;
    const result = (updatesByRef && !updatesByRef.isEmpty()) ?
        _.uniqBy(value.concat(updatesByRef.toJS()), '$ref')
         :
        value;

    // Remove values deleted by ref from the result
    return _.filter(result,
      (ref) => !deletedByRef.some((_ref) => ref.$ref === _ref.get('$ref'))
    );
  }

  createPropertyGetter(key, itemId) {
    const resourceName = _.findKey(this.descriptions, (desc) => desc.key === key);
    const resource = this.resources[resourceName];

    return () =>
      this.generateField(
        key,
        itemId,
        resource._items.getIn([itemId.toString(), key]).toJS()
      );
  }

  update(itemId, value, key) {
    console.log(':: update', itemId, value, key);
    const resourceName = _.findKey(this.descriptions, (desc) => desc.key === key);
    const description = this.descriptions[resourceName];
    const targetDescription = this.descriptions[description.target];
    const resource = this.resources[resourceName];
    const target = this.resources[description.target];

    // An update can mean several things for references.
    // It can be a new reference, than just update the current resource.
    // When it undoes a reference deleted by target resource. Undo that action.
    // When it undoes a reference deleted by this resource, undo that action.

    const _value = value; // Only keep the values

    // WHen an update is also reflected in target updates, send an action to remove that.
    // Find those updates where this item is touched

    this.findUpdatedByRef(key, itemId)
      .forEach((updateValue) => {
        const targetId = _.get(
          updateValue.get('$ref').match(`\/${description.target}\/(.+)`),
          1
        );
        // Find all updates where this resource is referenced.
        if (!_.some(value, (ref) => ref.$ref === updateValue.get('$ref'))) {
          // Trigger update on target reference to remove the value.
          target.actions.update(
            targetId,
            target._updates
                  .getIn([targetId, targetDescription.key])
                  .filter((ref) =>
                    ref.get('$ref') !== `/${targetDescription.target}/${itemId}`
            ),
            targetDescription.key
          );
        // } else if () {
        }
      });

    // if a value is removed, undo that remove.
    this.findDeletedByRef(key, itemId)
      .forEach((updateValue) => {
        const targetId = _.get(
          updateValue.get('$ref').match(`\/${description.target}\/(.+)`),
          1
        );
        if (_.some(value, (ref) => ref.$ref === updateValue.get('$ref'))) {
          target.actions.update(
            targetId,
            target._updates
                  .getIn([targetId, targetDescription.key], List())
                  .concat([
                    target._items
                          .getIn([targetId, targetDescription.key])
                          .find((ref) =>
                            ref.get('$ref') === `/${targetDescription.target}/${itemId}`
                          )
                  ]).toJS(),
            targetDescription.key
          );
        }
      });

    resource.actions.update(itemId, _value, key);
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
    this._items = state.get('items');
                      // .mergeWith(
                      //   (prev, next) => (List.isList(prev) ? next : prev.merge(next)),
                      //   this._updates
                      // );

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
    return this._items
               .mergeWith(
                 (prev, next) => (List.isList(prev) ? next : prev.merge(next)),
                 this._updates
               )
               .map(this.wrapReferencedResource.bind(this));
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
