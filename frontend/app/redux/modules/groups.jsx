import _ from 'lodash'
import { push } from 'react-router-redux'
import Immutable from 'immutable'

const CREATE = 'pms/groups/CREATE';
const UPDATE = 'pms/groups/UPDATE';

const initialState = Immutable.fromJS({
  items: {
      bestuur: {
        "id": "bestuur",
        "name": "Bestuur",
        "description": "Alle bestuursleden"
      },
      leden: {
        "id": "leden",
        "name": "Leden",
        "description": "Alle leden"
      },
      oudleden: {
        "id": "oudleden",
        "name": "Oud Leden",
        "description": "Alle oud leden"
      }
  },
  updates: {},
  dirty: false
});

export function update(id, group) {
  return {
    type: CREATE,
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
      type: UPDATE,
      data: {
        id: id.toString(), // TODO: is a string for now parseInt(id, 10)
      }
    })
    dispatch(push(`/groepen/${id}`))
  }
}


const reducers = {
  [CREATE]: (groups, {data}) => 
      groups.mergeDeep({
          items: {
              [data.id]: {}
          }
      }),

  [UPDATE]: (groups, {data}) => 
      groups.mergeDeep({
          items: {
              [data.id]: data.group
          },
          updates: {
            [data.id]: data.group
          }
      })
}

export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
