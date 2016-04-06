import _ from 'lodash';
import Immutable from 'immutable';
import { CLEAR } from './clearState';
import { apiAction } from 'redux/apiWrapper';

const initialState = Immutable.Map();

const MOVE_SCHEMAFIELD = 'pms/fields/MOVE_SCHEMAFIELD';
const CREATE_FIELDSET = 'pms/fields/CREATE_FIELDSET';
const UPDATE_FIELD = 'pms/fields/UPDATE_FIELD';


const FETCH = 'pms/fields/FETCH';
const FETCH_SUCCESS = 'pms/fields/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/fields/FETCH_FAIL';

// const PUSH = 'pms/fields/PUSH';
// const PUSH_SUCCESS = 'pms/fields/PUSH_SUCCESS';
// const PUSH_FAIL = 'pms/fields/PUSH_FAIL';

// const UPDATE = 'pms/fields/UPDATE';
// const REVERT = 'pms/fields/REVERT';
// const CREATE = 'pms/fields/CREATE';

export function fetch() {
  return apiAction({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'fields'
  });
}

export function createSet(schema, fromIndex, toIndex) {
  return {
    type: CREATE_FIELDSET,
    data: {
      schema, fromIndex, toIndex
    }
  };
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
  };
}

export function updateField(schema, id, field) {
  return {
    type: UPDATE_FIELD,
    data: {
      id: id.toString(),
      schema,
      field
    }
  };
}

// Index depths
const FIELD = 2;
const SET = 1;
const GROUP = 0;

function moveSchemaField(schema, fromIndex, toIndex) {
  const field = schema.getIn(
    ['form', fromIndex[GROUP], 'fields', fromIndex[SET], fromIndex[FIELD]]);
  // move (delete and add) the field from fromIndex to toIndex.

  let _schema = schema;

  // mind the order,
  if (fromIndex[FIELD] > toIndex[FIELD]) {
    // remove the field first, then add
    _schema = _schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]],
                (fieldset) => fieldset.splice(fromIndex[FIELD], 1))
           .updateIn(['form', toIndex[GROUP], 'fields', toIndex[SET]],
                (fieldset) => fieldset.splice(toIndex[FIELD], 0, field));
  } else {
    // other way around
    _schema = _schema.updateIn(['form', toIndex[GROUP], 'fields', toIndex[SET]],
                (fieldset) => fieldset.splice(toIndex[FIELD], 0, field))
           .updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]],
                (fieldset) => fieldset.splice(fromIndex[FIELD], 1));
  }
  // remove old fieldset if it was empty
  const oldFieldset = _schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]]);
  if (oldFieldset.isEmpty()) {
    _schema = _schema.updateIn(
      ['form', fromIndex[GROUP], 'fields'],
      (fields) => fields.splice(fromIndex[SET], 1)
    );
  }
  // return updated schema
  return _schema;
}

function createSchemaSet(schema, fromIndex, toIndex) {
  // get field to move.
  const field = schema.getIn(
    ['form', fromIndex[GROUP], 'fields', fromIndex[SET], fromIndex[FIELD]]);
  console.log('Moving field:', field, fromIndex, toIndex);

  let _schema = schema;

  // remove from old place.
  _schema = _schema.updateIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]],
              (fieldset) => fieldset.splice(fromIndex[FIELD], 1));

  console.log('From:', schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndex[SET]]).toJS());
  console.log('To:', _schema.getIn(['form', toIndex[GROUP]]).toJS());

  // add in the new place.
  _schema = _schema.updateIn(
    ['form', toIndex[GROUP], 'fields'],
    (fieldsets) => fieldsets.splice(toIndex[SET], 0, Immutable.List([field]))
  );

  let fromIndexSet = fromIndex[SET];

  // if the new fieldset was created in the same group, and before the empty old fieldset,
  // the fromIndex[SET] index has increased by 1.
  if ((fromIndex[GROUP] === toIndex[GROUP]) && (fromIndex[SET] > toIndex[SET])) {
    fromIndexSet += 1;
  }

  // remove old fieldset if it was empty
  const oldFieldset = _schema.getIn(['form', fromIndex[GROUP], 'fields', fromIndexSet]);
  if (oldFieldset.isEmpty()) {
    _schema = _schema.updateIn(
      ['form', fromIndex[GROUP], 'fields'],
      (fields) => fields.splice(fromIndexSet, 1)
    );
  }

  // return updated schema
  return _schema;
}

const reducers = {

  [FETCH]: (fields) =>
    fields.merge({ fetching: true }),

  [FETCH_SUCCESS]: (fields, { data }) =>
    // Create an indexed object with key = Object id
    fields.mergeDeep({
      fetching: false,
      loaded: true, // Only set initially, So the ui know it has data.
      items: data
    }),

  [FETCH_FAIL]: (fields, { error }) =>
    fields.merge({ fetching: false, error }),


  [MOVE_SCHEMAFIELD]: (fields, { data }) =>
  fields.setIn(['items', data.schema],
          moveSchemaField(fields.getIn(['items', data.schema]),
                  data.fromIndex, data.toIndex)),

  [CREATE_FIELDSET]: (fields, { data }) =>
  fields.setIn(['items', data.schema],
          createSchemaSet(fields.getIn(['items', data.schema]),
                  data.fromIndex, data.toIndex)),

  [UPDATE_FIELD]: (fields, { data }) =>
  fields.updateIn(['items', data.schema, 'fields', data.id],
            (field) => field.merge(data.field)),

  [CLEAR]: () => initialState
};

export default (state = initialState, action) =>
  _.get(
    reducers,
    action.type,   // Get type reducer
    (_state) => _state // Default passtrough
  )(state, action);
