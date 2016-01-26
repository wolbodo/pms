import update from  'react-addons-update';
import constants from 'constants'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  items: {},
  updates: {},
  dirty: false
})

function memberReducer(state = initialState, action) {
  
  switch (action.type) {
    case constants.MEMBERS_RECEIVE:
      let members = Immutable.fromJS(action.members)
      return state.merge({
        items: members.reduce(
                  (lookup, item) => lookup.set(item.get('id'), id),
                  Immutable.Map()
              )
      })
    case constants.MEMBERS_UPDATE:
      if (!_.matches(action.member)(state.items[action.id])) {
        // changed
        return state.updateIn(['items', action.id], member => member.mergeDeep(action.member))
                    .update('updates', updates => updates.mergeDeep({[action.id]: action.member}))
      }
      break;
    case constants.FIELDS_CREATE_MEMBERS_COMMIT:
      return state.merge({updates: {}});
    case constants.MEMBERS_CREATE:
      return state.update('items', items => items.merge({[action.id]: {id: action.id}}))
  }
  return state;
}


export default memberReducer