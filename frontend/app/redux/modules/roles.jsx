import _ from 'lodash';
// import { push } from 'react-router-redux';
import Immutable from 'immutable';

import { apiAction, API } from 'redux/apiWrapper';
import { CLEAR } from './clearState';

const FETCH = 'pms/roles/FETCH';
const FETCH_SUCCESS = 'pms/roles/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/roles/FETCH_FAIL';

const PUSH = 'pms/roles/PUSH';
const PUSH_SUCCESS = 'pms/roles/PUSH_SUCCESS';
const PUSH_FAIL = 'pms/roles/PUSH_FAIL';

const UPDATE = 'pms/roles/UPDATE';
const REVERT = 'pms/roles/REVERT';
const CREATE = 'pms/roles/CREATE';

const COMMIT_FINISHED = 'pms/roles/COMMIT_FINISHED';

const initialState = Immutable.fromJS({
  loading: false
});

export function fetch() {
  return apiAction({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'roles'
  });
}

export function update(id, role) {
  return {
    type: UPDATE,
    data: {
      id: id.toString(), // TODO: is a string for now parseInt(id, 10),
      role
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
    // dispatch(push(`/groepen/${id}`));
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

    const roles = getState().get('roles');
    // Save all updates
    roles.get('updates', new Immutable.Map())
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
  [FETCH]: (roles) =>
    roles.merge({ loading: true }),

  [FETCH_SUCCESS]: (roles, { data }) =>
    roles.merge({
      fetching: false,
      loaded: true, // Only set initially, So the ui know it has data.
      items: data.roles
    }),

  [FETCH_FAIL]: (roles, { error }) =>
    roles.merge({ loading: false, error }),


  [PUSH]: (roles) =>
    roles.merge({ pushing: true }),

  [PUSH_SUCCESS]: (roles, { data }) =>
    roles.mergeDeep({
      pushing: false,
      items: data.roles
    }),

  [PUSH_FAIL]: (roles, { error }) =>
    roles.merge({
      pushing: false,
      error
    }),

  [REVERT]: (roles) =>
    roles.set('updates', new Immutable.Map()),

  // Local changes and push
  [CREATE]: (roles, { data }) =>
    roles.mergeDeep({
      updates: {
        [data.id]: {}
      }
    }),

  [UPDATE]: (roles, { data }) =>
    roles.mergeDeep({
      updates: {
        [data.id]: data.role
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
