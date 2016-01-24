import initialState from './permissions.state.json'
import constants from 'constants'

function permissionsReducer(state = initialState, action) {
	switch (action.type) {
		case constants.PERMISSION_SET:
			return state
		default:
			return state;
	}
}


export default permissionsReducer