import $fetch from 'isomorphic-fetch'
import constants from 'constants'
import { routeActions } from 'redux-simple-router'

// export function selectReddit(members) {
//   return {
//     type: SELECT_REDDIT,
//     reddit
//   }
// }

// export function invalidateReddit(reddit) {
//   return {
//     type: INVALIDATE_REDDIT,
//     reddit
//   }
// }
function receive(members) {
  return {
    type: constants.MEMBERS_RECEIVE,
    members: members,
    receivedAt: Date.now()
  }
}




function shouldFetchMembers(state) {
  if (state.members.dirty) {
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
    type: constants.MEMBERS_UPDATE,
    id, member
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      type: constants.MEMBERS_CREATE,
      id: id
    })
    dispatch(routeActions.push(`/lid-${id}`))
  }
}