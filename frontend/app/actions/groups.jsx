import { routeActions } from 'redux-simple-router'
import constants from 'constants'

export function update(id, group) {
  return {
    type: constants.GROUPS_UPDATE,
    id, group
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      type: constants.GROUPS_CREATE,
      id: id
    })
    dispatch(routeActions.push(`/groepen/${id}`))
  }
}