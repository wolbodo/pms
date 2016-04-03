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
  if (state.getIn(['people', 'updates']).isEmpty()) {
    return true
  } else {
    // check timestamp?
    return false
  }
}

function callAPI(uri, config) {
  return $fetch("/api/" + uri, config)
    .then(response => response.json())
    .then(body => {
      if (body.error) {
        throw body.error
      }
      return body
    })
}

export function fetch(token) {
  return (dispatch, getState) => {
    if ( shouldFetchPeople(getState()) ) {
      return callAPI("people", { 
        headers: new Headers({
          "Authorization": token
        })
      })
      .then(resp => dispatch(receive(resp)))
      .catch(e => {console.error("API-error:", e)})
    }
  }
}

function update_success(body) {
  return {
    name: 'PERSON_UPDATE_SUCCESS',
    data: body
  }
}

function update_person(token, dispatch, person, update) {
  return callAPI('person/' + person.get('id'), {
    method: 'PUT',
    headers: new Headers({
      "Authorization": token
    }),
    body: JSON.stringify(
      update.merge({
        gid: person.get('gid')
      })
    )
  })
  .then(body => dispatch(update_success(body)))
  .catch((e) => console.error("API-error:", e))
}

function add_person(token, dispatch, person) {
  return callAPI('people', {
    method: 'POST',
    headers: new Headers({
      "Authorization": token
    }),
    body: JSON.stringify(
      person
    )
  })
  .then(body => dispatch(update_success(body)))
  .catch((e) => console.error("API-error:", e))
}


export function commit(token) {

  return (dispatch, getState) => {
    let people = getState().app.get('people')

    return Promise.all(
      people.get('updates')
        .map((_person, i) => 
          // Add or update person, whether gid exists.
          people.hasIn(['items', i, 'gid'])
           ? update_person(token, dispatch, people.getIn(['items', i]), _person)
           : add_person(token, dispatch, _person)

        )
    )
    .then(dispatch({
      name: 'PEOPLE_COMMIT_UPDATES'
    }))
  }
}

export function revert() {
  return {
    name: 'PEOPLE_REVERT_UPDATES'
  }
}

export function update(id, value, key) {
  return {
    name: constants.PEOPLE_UPDATE,
    data: {
      id: id.toString(), 
      value, key
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