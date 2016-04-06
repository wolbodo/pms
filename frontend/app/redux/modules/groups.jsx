import _ from 'lodash';
import { push } from 'react-router-redux';
import Immutable from 'immutable';

import API from 'redux/apiWrapper';
import { CLEAR } from './clearState';

const FETCH = 'pms/groups/FETCH';
const FETCH_SUCCESS = 'pms/groups/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/groups/FETCH_FAIL';

// const PUSH = 'pms/groups/PUSH';
// const PUSH_SUCCESS = 'pms/groups/PUSH_SUCCESS';
// const PUSH_FAIL = 'pms/groups/PUSH_FAIL';

const UPDATE = 'pms/groups/UPDATE';
// const REVERT = 'pms/groups/REVERT';
const CREATE = 'pms/groups/CREATE';

// const COMMIT_FINISHED = 'pms/groups/COMMIT_FINISHED';

const initialState = Immutable.fromJS({
  loading: false
});

export function fetch() {
  return API({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'roles'
  });
}

export function update(id, group) {
  return {
    type: CREATE,
    data: {
      id: id.toString(), // TODO: is a string for now parseInt(id, 10),
      group
    }
  };
}

export function create() {
  return (dispatch) => {
    const id = Date.now();
    dispatch({
      type: UPDATE,
      data: {
        id: id.toString(), // TODO: is a string for now parseInt(id, 10)
      }
    });
    dispatch(push(`/groepen/${id}`));
  };
}


const reducers = {

  // Api handling states.
  [FETCH]: (groups) =>
    groups.merge({ loading: true }),

  [FETCH_SUCCESS]: (groups, { data }) =>
    groups.merge({
      fetching: false,
      loaded: true, // Only set initially, So the ui know it has data.
      items: data
    }),

  [FETCH_FAIL]: (groups, { error }) =>
    groups.merge({ loading: false, error }),

  // Local changes and push
  [CREATE]: (groups, { data }) =>
    groups.mergeDeep({
      updates: {
        [data.id]: {}
      }
    }),

  [UPDATE]: (groups, { data }) =>
    groups.mergeDeep({
      updates: {
        [data.id]: data.group
      }
    }),

  [CLEAR]: () => initialState
};

export default (state = initialState, action) =>
  _.get(
    reducers,
    action.type,   // Get type reducer
    (_state) => _state // Default passtrough
  )(state, action);
