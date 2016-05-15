import _ from 'lodash';

// Schema resource utility functions


export function getResources(resources, schema) {
  return _.chain(schema.properties)
          .filter(_.matches({ type: 'reference' }))
          .keyBy((property) => property.target)
          .mapValues((property) => _.get(resources, property.target))
          .value();
}

export function getResourceFieldPermissions(resourceType, resourceId, fieldSchema, field, auth) {
  const permissions = (
    (resourceType === 'people') && (resourceId === auth.user.user))
     ? _.merge({}, auth.permissions.people.self, auth.permissions.people)
     : _.get(auth, ['permissions', resourceType]);

  if (!(fieldSchema && fieldSchema.type)) {
    return {};
  }

  if (fieldSchema.type === 'reference') {
    // Figure out permissions due to indirect permissions

    const referenceTable = _.join(_.sortBy([fieldSchema.target, resourceType]), '_');

    // Map create permissions on the specific resourceId.
    // if any properties defined on permissions.create, check on which type it is mapped.
    const refPermissions = _.get(auth, ['permissions', referenceTable, 'create']);

    // Figure out the filtering.
    const currentResource = `${resourceType}_id`;
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

export function getReferencedResource(resources, fieldSchema) {
  return _.get(resources, fieldSchema.target);
}
