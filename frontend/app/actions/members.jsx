import $fetch from 'isomorphic-fetch'
import constants from 'constants'
import { routeActions } from 'redux-simple-router'


function receive(members) {
  return {
    name: constants.MEMBERS_RECEIVE,
    data: {
      members: members,
      receivedAt: Date.now()
    }
  }
}

function shouldFetchMembers(state) {
  if (state.app.getIn(['members', 'updates']).isEmpty()) {
    return false
  } else {
    // check timestamp?
    return true
  }
}

export function fetch(token) {
  return (dispatch, getState) => {
    if ( shouldFetchMembers(getState()) ) {
      return $fetch("/api/members", {
  				headers: new Headers({
  					"Authorization": token
  				})
        })
        .then(response => response.json())
        .then(json => dispatch(receive(json)))
    }
  }
}

export function update(id, member) {
  return {
    name: constants.MEMBERS_UPDATE,
    data: {
      id, member
    }
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      name: constants.MEMBERS_CREATE,
      data: {
        id: id
      }
    })
    dispatch(routeActions.push(`/lid-${id}`))
  }
}