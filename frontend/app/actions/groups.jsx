import { routeActions } from 'redux-simple-router'
import constants from 'constants'

export function update(id, group) {
  return {
    name: constants.GROUPS_UPDATE,
    data: {
      id, group
    }
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      name: constants.GROUPS_CREATE,
      data: {
        id: id
      }
    })
    dispatch(routeActions.push(`/groepen/${id}`))
  }
}