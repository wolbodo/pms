import update from  'react-addons-update';
import _ from  'lodash'
import constants from 'constants'

const initialState = {
  items: {},
  updates: {},
  dirty: false
}

function memberReducer(state = initialState, action) {
  switch (action.type) {
    case constants.MEMBERS_RECEIVE:
      return Object.assign({}, state, {
        items: _.indexBy(action.members, 'id'),
      })
    case constants.MEMBERS_UPDATE:
      if (!_.matches(action.member)(state.items[action.id])) {
        // changed
      	return update(state, {
      		items: {
      			[action.id]:  {
              $merge: action.member
            } 
      		},
          updates: {
            $merge: {
              [action.id]: action.member
            }
          },
      		dirty: {
      			$set: true
      		}
      	})
      }
      break;
    case constants.FIELDS_CREATE_MEMBERS_COMMIT:
    	return update(state, {
    		dirty: false
    	})
    case constants.MEMBERS_CREATE:
      return update(state, {
        items: {
          $merge: {
            [action.id]: {
              id: action.id
            }
          }
        },
        dirty: {
          $set: true
        }
      })
  }
  return state;
}


export default memberReducer