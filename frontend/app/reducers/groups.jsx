import update from  'react-addons-update';

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
		case "GROUPS_UPDATE": 
	    	return update(state, {
	    		items: {
	    			[action.id]: {
	    				$set: action.group
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