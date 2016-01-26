import update from  'react-addons-update';
import constants from 'constants'
import initialState from './fields.state.json'
import Immutable from 'immutable'


let _initialState = Immutable.fromJS(initialState).merge({updates: {}})

// Index depths
const FIELD = 2,
      SET   = 1,
      GROUP = 0;

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


function fieldreducer(state = _initialState, action) {
  let schema = state.getIn('schemas', action.schema),
    {fromIndex, toIndex} = action;

  switch (action.type) {
    case constants.FIELDS_MOVE_SCHEMAFIELD:
      return schema.updateIn(['schemas', action.schema], moveSchemaField(schema, fromIndex, toIndex))
    case constants.FIELDS_CREATE_FIELDSET:
      return schema.updateIn(['schemas', action.schema], createSchemaSet(schema, fromIndex, toIndex))
    case constants.FIELDS_UPDATE_FIELD:
      return schema.updateIn(['schemas', action.schema, 'fields', action.id], 
                            field => field.merge(action.field))
    default:
      return state;
  }
}


export default fieldreducer
