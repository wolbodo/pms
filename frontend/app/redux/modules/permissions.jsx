import _ from 'lodash';
import Immutable from 'immutable';
import { CLEAR } from './clearState';
import { apiAction } from 'redux/apiWrapper';

const initialState = Immutable.Map();

const FETCH = 'pms/people/FETCH';
const FETCH_SUCCESS = 'pms/people/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/people/FETCH_FAIL';

const SET = 'pms/permissions/SET';
const CHANGE = 'pms/permissions/CHANGE';

export function change(_change) {
  return {
    name: CHANGE,
    data: _change
  };
}

export function fetch() {
  return apiAction({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'permissions'
  });
}

const reducers = {
  [FETCH]: (permissions) =>
    permissions.merge({ fetching: true }),

  [FETCH_SUCCESS]: (permissions, { data }) =>
    // Create an indexed object with key = Object id
    permissions.mergeDeep({
      fetching: false,
      loaded: true, // Only set initially, So the ui know it has data.
      items: data.roles_permissions
    }),

  [FETCH_FAIL]: (permissions, { error }) =>
    permissions.merge({ fetching: false, error }),

  [SET]: (permissions) =>
    permissions,

  [CHANGE]: (permissions, { data }) =>
    permissions.updateIn([data.role.id, data.schema, 'read'],
      (readperms) => (data.read ?
        Immutable.Set(readperms).add(data.field.name)
        : Immutable.Set(readperms).remove(data.field.name)
      ))
      .updateIn([data.role.id, data.schema, 'write'],
      (writeperms) => (data.write ?
        Immutable.Set(writeperms).add(data.field.name)
        : Immutable.Set(writeperms).remove(data.field.name)
      )),
  [CLEAR]: () => initialState
};

export default (state = initialState, action) =>
  _.get(
    reducers,
    action.type,   // Get type reducer
    (_state) => _state // Default passtrough
  )(state, action);
