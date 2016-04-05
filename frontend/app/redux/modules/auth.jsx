import _ from 'lodash'
import Immutable from 'immutable'
import { push } from 'react-router-redux'

import API from 'redux/apiWrapper'

import {CLEAR} from './clearState'

const initialState = Immutable.fromJS({
  loggedIn: false,
  loading: false
});

const START = 'pms/auth/LOGIN_START';
const SUCCESS = 'pms/auth/LOGIN_SUCCESS';
const FAIL = 'pms/auth/LOGIN_FAIL';
const LOGOUT = 'pms/auth/LOGOUT';

export function login(username, password) {
  return API({
    types: [START, SUCCESS, FAIL],
    uri: 'login', 
    options: {
      body: {
        user: username,
        password: password
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
      loading: true
    }),

  [SUCCESS]: (auth, {data}) => {
    // get the userinfo from the token.
    let user = JSON.parse(
      atob(
        data.token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
      )
    )

    return auth.merge({
      loggedIn: true,
      loading: false,
      token: data.token,
      user: user
    })
  },

  [FAIL]: (auth) => 
    auth.merge({
      loading: false
    }),
    
  [CLEAR]: state => initialState

}

export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
