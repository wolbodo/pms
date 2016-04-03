import { push } from 'react-router-redux'
import constants from 'constants'

export function update(id, group) {
  return {
    type: constants.GROUPS_UPDATE,
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
      type: constants.GROUPS_CREATE,
      data: {
        id: id.toString(), // TODO: is a string for now parseInt(id, 10)
      }
    })
    dispatch(push(`/groepen/${id}`))
  }
}