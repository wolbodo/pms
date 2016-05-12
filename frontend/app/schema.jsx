import _ from 'lodash';

// Schema resource utility functions


export function getResources(resources, schema) {
  return _.chain(schema.properties)
          .filter(_.matches({ type: 'reference' }))
          .keyBy((property) => property.target)
          .mapValues((property) => _.get(resources, property.target))
          .value();
}

export function getReferencedResource(resources, fieldSchema) {
  return _.get(resources, fieldSchema.target);
}
