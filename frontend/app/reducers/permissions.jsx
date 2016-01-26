import initialState from './permissions.state.json'
import constants from 'constants'
import Immutable from 'immutable'
    
let _initialState = Immutable.fromJS(initialState)

function permissionsReducer(state = _initialState, action) {
    switch (action.type) {
        case constants.PERMISSION_SET:
            return state
        default:
            return state;
    }
}


export default permissionsReducer