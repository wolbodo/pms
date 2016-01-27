import initialState from './fields.state.json'
import Immutable from 'immutable'

// Index depths
const FIELD = 2,
      SET   = 1,
      GROUP = 0;

let CONSTRUCT,
    FIELDS_MOVE_SCHEMAFIELD,
    FIELDS_CREATE_FIELDSET,
    FIELDS_UPDATE_FIELD

CONSTRUCT = () => 
  Immutable.fromJS(initialState)
           .merge({updates: {}})



function moveSchemaField(schema, fromIndex, toIndex) {

    const field = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[1], fromIndex[2]])

    // move (delete and add) the field from fromIndex to toIndex.

    // mind the order, 
    if (fromIndex[FIELD] > toIndex[FIELD]) {
      // remove the field first, then add
      schema = schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                                fieldset => fieldset.splice(fromIndex[FIELD], 1))
                     .updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                                fieldset => fieldset.splice(toIndex[FIELD], 0, field))
    } else {
      // other way around
      schema = schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]],
                                fieldset => fieldset.splice(toIndex[FIELD], 0, field))
                     .updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                                fieldset => fieldset.splice(fromIndex[FIELD], 1))
    }

    // remove old fieldset if it was empty
    var old_fieldset = schema.getIn([fromIndex[GROUP], 'fields', fromIndex[SET]]);
    if (old_fieldset.isEmpty()) {
      schema = schema.updateIn(['form', fromIndex[GROUP], 'fields'], fields => fields.splice(fromIndex[SET], 1))
    }
    // return updated schema
    return schema;
}

function createSchemaSet(schema, fromIndex, toIndex) {
  const field = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET], fromIndex[FIELD]])

  // remove from old place.
  schema = schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                            fieldset => fieldset.splice(fromIndex[FIELD], 1))

  // add in the new place.
  schema = schema.updateIn(['form', fromIndex[GROUP], 'fields'], fieldsets => fieldset.splice(toIndex[SET], 0, [field]))

  // remove old fieldset if it was empty
  var old_fieldset = schema.getIn([fromIndex[GROUP], 'fields', fromIndex[SET]]);

  if (old_fieldset.isEmpty()) {
    schema = schema.updateIn(['form', fromIndex[GROUP], 'fields'], fields => fields.splice(fromIndex[SET], 1))
  }
  // return updated schema
  return schema;
}


FIELDS_MOVE_SCHEMAFIELD = (fields, {data}) =>
  fields.updateIn(['schemas', data.schema], 
                  moveSchemaField(fields.getIn(['schemas', data.schema]), 
                                  data.fromIndex, data.toIndex))

FIELDS_CREATE_FIELDSET = (fields, {data}) =>
  fields.updateIn(['schemas', data.schema], 
                  createSchemaSet(fields.getIn(['schemas', data.schema]), 
                                  data.fromIndex, data.toIndex))

FIELDS_UPDATE_FIELD = (fields, {data}) =>
  fields.updateIn(['schemas', data.schema, 'fields', data.id], 
                    field => field.merge(data.field))


export {
  CONSTRUCT,
  FIELDS_MOVE_SCHEMAFIELD,
  FIELDS_CREATE_FIELDSET,
  FIELDS_UPDATE_FIELD
}