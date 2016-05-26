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

export function generateReverseRefs(type, resource, refResources, fields) {
  // var schema = _.get(fields, ['items', type]);
  console.log(`generating: ${{ type, resource, refResources, fields }}`);

  if (_.isNumber(resource.id)) {
    // Its a single resource

    // // Map over the refResources, and for every update, find all references this object
    // _(refResources)
    // .each((refResource, name) => {
    //   const refSchema = _.get(fields, ['items', name]);
    //   // Pick refProps targeting this type.
    //   const refProps = _.pickBy(
    //     refSchema.properties,
    //     (property) => (property.type === 'reference' && property.target === type)
    //   );

    //   if (_.isEmpty(refProps)) {
    //     // Nothing to look for
    //     return;
    //   }

    //   console.log(
    //     'reverseRefs?',
    //     _(refResource.updates) // For every resource in updates.
    //       .pickBy((res) =>
    //         // Get resources creating a reverse reference
    //         _.some(res, (prop, propname) =>
    //           // Reverse prop and referecing the resource
    //           _.includes(_.keys(refProps), propname) &&
    //           _.some(prop, _.matches({ $ref: `/${type}/${resource.id}` }))
    //         )
    //           // TODO: There could be multiple references in resources, that is not the case now.
    //       )
    //       // Generate reverse references
    //       .map((res) =>
    //       )
    //           // Create a mapping of name on value
    //       // .filter((res) => !_.isEmpty(res))
    //       .value()
    //   );
    //   //   _.map(refResource.updates,
    //   //     (res) =>
    //   //     // All props with a reverse reference
    //   //     _.pickBy(res, (prop, propname) =>
    //   //       _.includes(_.keys(refProps), propname)
      //     )
      //   )
      // );
    // });
  } else {
    // Its a resource set
  }
}

export function getReferencedResource(resources, fieldSchema) {
  return _.get(resources, fieldSchema.target);
}
