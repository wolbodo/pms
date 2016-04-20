import _ from 'lodash';
import Immutable from 'immutable';
import { CLEAR } from './clearState';

const initialState = Immutable.Map();

const SET = 'pms/permissions/SET';
const CHANGE = 'pms/permissions/CHANGE';

export function change(_change) {
  return {
    name: CHANGE,
    data: _change
  };
}

const reducers = {
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
