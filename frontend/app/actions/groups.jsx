import { routeActions } from 'redux-simple-router'
import constants from 'constants'

export function update(id, group) {
  return {
    name: constants.GROUPS_UPDATE,
    data: {
      id: id.toString(), // TODO: is a string for now parseInt(id, 10), 
      group
    }
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      name: constants.GROUPS_CREATE,
      data: {
        id: id.toString(), // TODO: is a string for now parseInt(id, 10)
      }
    })
    dispatch(routeActions.push(`/groepen/${id}`))
  }
}