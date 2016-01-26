import update from  'react-addons-update';
import constants from 'constants'
import Immutable from 'immutable'

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
})

function groupsReducer(state = initialState, action) {
    
    switch (action.type) {
        case constants.GROUPS_CREATE:
            return state.mergeDeep({
                items: {
                    [action.id]: {}
                }
            })
        case constants.GROUPS_UPDATE: 
            return state.mergeDeep({
                items: {
                    [action.id]: action.group
                }
            })
        default:
            return state;
    }
}


export default groupsReducer