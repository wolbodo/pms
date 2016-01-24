import update from  'react-addons-update';
import _ from  'lodash'
import constants from 'constants'

const initialState = {
  items: {},
  dirty: false
}

function memberReducer(state = initialState, action) {
  switch (action.type) {
    case constants.MEMBERS_RECEIVE:
      return Object.assign({}, state, {
        items: _.keyBy(action.members, 'id'),
        dirty: false
      })
    case constants.MEMBERS_UPDATE:
    	return update(state, {
    		items: {
    			[action.id]:  {
            $merge: action.member
          } 
    		},
    		dirty: {
    			$set: true
    		}
    	})
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
    default:
      return state;
  }
}


export default memberReducer