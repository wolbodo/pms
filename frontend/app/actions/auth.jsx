import $fetch from 'isomorphic-fetch'
import { routeActions } from 'react-router-redux'
import constants from 'constants'

function login_request() {
  return {
    name: constants.AUTH_LOGIN_REQUEST
  }
}

function login_success(token) {
  return {
    name: constants.AUTH_LOGIN_SUCCESS,
    data: {
      token: token
    }
  }
//   FixeMe? 
}
function login_error(err) {
  return {
    name: constants.AUTH_LOGIN_ERROR,
    error: {
      message: err.toString(),
      err: err
    }
  }
}
function login_request(username, password) {
  return {
    name: constants.AUTH_LOGIN_REQUEST,
    data: {
      username: username,
      password: password
    }
  }
}

export function login(username, password) {
  return dispatch => {
    return $fetch("/api/login", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        user: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(body => {
      if (body.error) {
        throw body.error
      }
      return body.token
    })
    .then(token => {
        dispatch(login_success(token))
    })
    .then(() => {
      dispatch(routeActions.push('/'))
    })
    .catch(err => dispatch(login_error(err)));
            
  }
}

export function logout() {
  return {
    name: constants.AUTH_LOGOUT_REQUEST
  }
}

export function requireLogin(store) {
  return (nextState, replaceState) => {
    const state = store.getState()

    if (!state.getIn(['app', 'auth', 'loggedIn'])) {
      replaceState('/login')
    }

  }
}