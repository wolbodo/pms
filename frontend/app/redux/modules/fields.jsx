import _ from 'lodash'
import _initialState from './fields.state.json'
import Immutable from 'immutable'

const initialState = Immutable.fromJS(_initialState)
                              .merge({updates: {}});

const MOVE_SCHEMAFIELD = 'pms/fields/MOVE_SCHEMAFIELD';
const CREATE_FIELDSET = 'pms/fields/CREATE_FIELDSET';
const UPDATE_FIELD = 'pms/fields/UPDATE_FIELD';


export function createSet(schema, fromIndex, toIndex) {
  return {
    type: CREATE_FIELDSET,
    data: {
      schema, fromIndex, toIndex
    }
  }
}

export function moveField(schema, fromIndex, toIndex) {
  // Moves field in schema 
  return {
    type: MOVE_SCHEMAFIELD,
    data: {
      schema,
      fromIndex,
      toIndex
    }
  }
}

export function updateField(schema, id, field) {
  return {
    type: UPDATE_FIELD,
    data: {
      id: id.toString(), 
      schema, 
      field
    }
  }
}

// Index depths
const FIELD = 2,
      SET   = 1,
      GROUP = 0;

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

const reducers = {
  [MOVE_SCHEMAFIELD]: (fields, {data}) =>
    fields.setIn(['schemas', data.schema], 
                    moveSchemaField(fields.getIn(['schemas', data.schema]), 
                                    data.fromIndex, data.toIndex)),

  [CREATE_FIELDSET]: (fields, {data}) =>
    fields.setIn(['schemas', data.schema], 
                    createSchemaSet(fields.getIn(['schemas', data.schema]), 
                                    data.fromIndex, data.toIndex)),

  [UPDATE_FIELD]: (fields, {data}) =>
    fields.updateIn(['schemas', data.schema, 'fields', data.id], 
                      field => field.merge(data.field))
}

export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
