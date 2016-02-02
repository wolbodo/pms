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

    const field = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET], fromIndex[FIELD]])
    // move (delete and add) the field from fromIndex to toIndex.

    // mind the order, 
    if (fromIndex[FIELD] > toIndex[FIELD]) {
      // remove the field first, then add
      schema = schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                                fieldset => fieldset.splice(fromIndex[FIELD], 1))
                     .updateIn(['form', toIndex[GROUP], 'fields', toIndex[SET]], 
                                fieldset => fieldset.splice(toIndex[FIELD], 0, field))
    } else {
      // other way around
      schema = schema.updateIn(['form', toIndex[GROUP], 'fields', toIndex[SET]],
                                fieldset => fieldset.splice(toIndex[FIELD], 0, field))
                     .updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                                fieldset => fieldset.splice(fromIndex[FIELD], 1))
    }
    // remove old fieldset if it was empty    
    var old_fieldset = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]]);
    if (old_fieldset.isEmpty()) {
      schema = schema.updateIn(['form', fromIndex[GROUP], 'fields'], fields => fields.splice(fromIndex[SET], 1))
    }
    // return updated schema
    return schema;
}

function createSchemaSet(schema, fromIndex, toIndex) {
  // get field to move.
  const field = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET], fromIndex[FIELD]])
  console.log("Moving field:", field, fromIndex, toIndex)

  // remove from old place.
  schema = schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]], 
                            fieldset => fieldset.splice(fromIndex[FIELD], 1))

  console.log("From:", schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]]).toJS())
  console.log("To:",   schema.getIn(['form', toIndex[GROUP]]).toJS())
  

  // add in the new place.
  schema = schema.updateIn(['form', toIndex[GROUP], 'fields'], fieldsets => fieldsets.splice(toIndex[SET], 0, Immutable.List([field])))

  let fromIndexSet = fromIndex[SET]
  // if the new fieldset was created in the same group, and before the empty old fieldset, the fromIndex[SET] index has increased by 1.
  if ((fromIndex[GROUP] === toIndex[GROUP]) && (fromIndex[SET] > toIndex[SET])) {
    fromIndexSet += 1
  } 

  // remove old fieldset if it was empty
  var old_fieldset = schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndexSet]);
  if (old_fieldset.isEmpty()) {
    schema = schema.updateIn(['form', fromIndex[GROUP], 'fields'], fields => fields.splice(fromIndexSet, 1))
  }
  
  // return updated schema
  return schema;
}


FIELDS_MOVE_SCHEMAFIELD = (fields, {data}) =>
  fields.setIn(['schemas', data.schema], 
                  moveSchemaField(fields.getIn(['schemas', data.schema]), 
                                  data.fromIndex, data.toIndex))

FIELDS_CREATE_FIELDSET = (fields, {data}) =>
  fields.setIn(['schemas', data.schema], 
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