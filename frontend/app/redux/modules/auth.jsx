import _ from 'lodash';
import Immutable from 'immutable';

import { apiAction } from 'redux/apiWrapper';

import { CLEAR } from './clearState';

const initialState = Immutable.fromJS({
  loggedIn: false,
  fetching: false
});

const START = 'pms/auth/LOGIN_START';
const SUCCESS = 'pms/auth/LOGIN_SUCCESS';
const FAIL = 'pms/auth/LOGIN_FAIL';
const LOGOUT = 'pms/auth/LOGOUT';

export function login(username, password) {
  return apiAction({
    types: [START, SUCCESS, FAIL],
    uri: 'login',
    options: {
      body: {
        user: username,
        password
      }
    }
  });
}

export function logout() {
  return {
    type: LOGOUT
  };
}

const reducers = {

  [START]: (auth) =>
    auth.merge({
      loggedIn: false,
      fetching: true
    }),

  [SUCCESS]: (auth, { data: { token, permissions } }) => {
    // get the userinfo from the token.
    const user = JSON.parse(
      atob(
        token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
      )
    );

    return auth.merge({
      loggedIn: true,
      fetching: false,
      token,
      permissions,
      user
    });
  },

  [FAIL]: (auth, { error: { error } }) =>
    auth.merge({
      fetching: false,
      error
    }),

  [CLEAR]: () => initialState
};

export default (state = initialState, action) =>
  _.get(
    reducers,
    action.type,   // Get type reducer
    (_state) => _state // Default passtrough
  )(state, action);
