import _ from 'lodash';

// Schema resource utility functions

export function generateReverseRefs(type, resource, refResources, fields) {
  // var schema = _.get(fields, ['items', type]);
  console.log(`generating: ${{ type, resource, refResources, fields }}`);

  if (_.isNumber(resource.id)) {
    // Its a single resource

    // // Map over the refResources, and for every update, find all references this object
    // _(refResources)
    // .each((refResource, name) => {
    //   const refSchema = _.get(fields, ['items', name]);
    //   // Pick refProps targetig tnhis type.
    //   const refProps = _.pic kBy(
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
    //         _.some(res, p(rop, propname) =>
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

