import $fetch from 'isomorphic-fetch'
import constants from 'constants'
import { routeActions } from 'react-router-redux'
import _ from 'lodash'


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
        .then(body => {
          if (body.error) 
            throw body.error
          return body
        })
        .then(json => dispatch(receive(json)))
        .catch(e => {
          console.error(e)
        })
    }
  }
}

export function commit(token) {

  return (dispatch, getState) => {
    return Promise.all(
      getState()
      .app.getIn(['people', 'updates'])
      .map((person, id) => 
        $fetch('/api/person/' + id, {
          headers: new Headers({
            "Authorization": token
          })
        })
        .then(resp => {
          if (resp.json().gid !== person.gid) {
            throw "Error updating"
          }
        })
        .then(() => $fetch('/api/person/' + id, {
          method: 'PUT',
          headers: new Headers({
            "Authorization": token
          }),
          body: JSON.stringify(person)
        }))
        .then(() => dispatch({
          name: 'FIELDS_CREATE_PEOPLE_COMMIT'
        }))
        .catch((e) => console.error(e))
      )
    )
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