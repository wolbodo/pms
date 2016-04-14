import _ from 'lodash';
import { push } from 'react-router-redux';
import Immutable from 'immutable';

import { apiAction, API } from 'redux/apiWrapper';
import { CLEAR } from './clearState';

const FETCH = 'pms/groups/FETCH';
const FETCH_SUCCESS = 'pms/groups/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/groups/FETCH_FAIL';

const PUSH = 'pms/groups/PUSH';
const PUSH_SUCCESS = 'pms/groups/PUSH_SUCCESS';
const PUSH_FAIL = 'pms/groups/PUSH_FAIL';

const UPDATE = 'pms/groups/UPDATE';
const REVERT = 'pms/groups/REVERT';
const CREATE = 'pms/groups/CREATE';

const COMMIT_FINISHED = 'pms/groups/COMMIT_FINISHED';

const initialState = Immutable.fromJS({
  loading: false
});

export function fetch() {
  return apiAction({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'roles'
  });
}

export function update(id, group) {
  return {
    type: UPDATE,
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
      type: CREATE,
      data: {
        id: id.toString(), // TODO: is a string for now parseInt(id, 10)
      }
    });
    dispatch(push(`/groepen/${id}`));
  };
}


export function revert() {
  return {
    type: REVERT
  };
}

export function commit() {
  return (dispatch, getState) => {
    const token = getState().getIn(['auth', 'token']);

    function post(/* body*/) {
      throw new Error('Not implemented');
      // creates new person.
      // TODO: Check for double post...
      // return {
      //   types: [PUSH, PUSH_SUCCESS, PUSH_FAIL],
      //   uri: 'roles',
      //   promise:
      //     // Create new person in api.
      //     API(token, 'roles', {
      //       body
      //     })
      // };
    }

    function put(id, data) {
      // Updates a person with data.
      // Fetches
      return {
        types: [PUSH, PUSH_SUCCESS, PUSH_FAIL],
        uri: `roles/${id}`, // For debugging
        promise:
          // fetch the role first, to see whether it has changed.
          API(token, `roles/${id}`)
          // Check whether it has been modified
          .then((result) => {
            if (result.status === 304) {
              // Good
            }
            // Should create trigger conflicts.
            // throw new Error('Fail')))

            return API(token, `roles/${id}`, {
              method: 'PUT',
              body: data
            });
          })
      };
    }

    const roles = getState().get('groups');
    // Save all updates
    roles.get('updates')
          .map((role, i) => (
            // Add or update role, whether gid exists.
            roles.hasIn(['items', i])
              // Existing role
            ? dispatch(put(i, role))
            // New role
            : dispatch(post(role))
          ));

    // Clear updates locally
    // FIXME: Clear when all commits were successfull.
    dispatch({
      type: COMMIT_FINISHED
    });
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


  [PUSH]: (roles) =>
    roles.merge({ pushing: true }),

  [PUSH_SUCCESS]: (roles, { data }) =>
    roles.mergeDeep({
      pushing: false,
      items: {
        [data.id]: data
      }
    }),

  [PUSH_FAIL]: (roles, { error }) =>
    roles.merge({
      pushing: false,
      error
    }),

  [REVERT]: (roles) =>
    roles.set('updates', new Map()),

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
