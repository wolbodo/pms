import $fetch from 'isomorphic-fetch'
import constants from 'constants'
import { routeActions } from 'react-router-redux'


function receive(people) {
  return {
    name: constants.PEOPLE_RECEIVE,
    data: {
      people: people,
      receivedAt: Date.now()
    }
  }
}

function shouldFetchPeople(state) {
  if (state.app.getIn(['people', 'updates']).isEmpty()) {
    return true
  } else {
    // check timestamp?
    return false
  }
}

export function fetch(token) {
  return (dispatch, getState) => {
    if ( shouldFetchPeople(getState()) ) {
      return $fetch("/api/people", {
  				headers: new Headers({
  					"Authorization": token
  				})
        })
        .then(response => response.json())
        .then(json => dispatch(receive(json)))
    }
  }
}

export function commit() {

  // return (dispatch, getState) => {
  //   return $fetch('/api/setperso')
  // }


  return {
    name: 'FIELDS_CREATE_PEOPLE_COMMIT'
  }
}

export function update(id, person) {
  return {
    name: constants.PEOPLE_UPDATE,
    data: {
      id: id.toString(), 
      person
    }
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      name: constants.PEOPLE_CREATE,
      data: {
        id: id.toString()
      }
    })
    dispatch(routeActions.push(`/lid-${id}`))
  }
}