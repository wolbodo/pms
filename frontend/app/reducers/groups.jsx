import update from  'react-addons-update';
import constants from 'constants'


const initialState = {
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
  dirty: false
}

function groupsReducer(state = initialState, action) {
	switch (action.type) {
		case constants.GROUPS_CREATE:
			return update(state, {
				items: {
					$merge: {
						[action.id]: {}
					}
				}
			})
		case constants.GROUPS_UPDATE: 
	    	return update(state, {
	    		items: {
	    			[action.id]: {
	    				$merge: action.group
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


export default groupsReducer