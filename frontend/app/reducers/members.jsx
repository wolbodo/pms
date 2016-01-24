import update from  'react-addons-update';
import _ from  'lodash'


const initialState = {
  items: {},
  dirty: false
}

function memberReducer(state = initialState, action) {
  switch (action.type) {
    case 'RECEIVE_MEMBERS':
      return Object.assign({}, state, {
        items: _.indexBy(action.members, 'id'),
        dirty: false
      })
    case 'MEMBERS_UPDATE':
    	return update(state, {
    		items: {
    			[action.id]: {
    				$set: action.member
    			}
    		},
    		dirty: {
    			$set: true
    		}
    	})
    case 'MEMBERS_COMMIT':
    	return update(state, {
    		dirty: false
    	})
    default:
      return state;
  }
}


export default memberReducer