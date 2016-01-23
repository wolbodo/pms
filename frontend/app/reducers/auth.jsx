
const initialState = {
	loggedIn: false
}

function update(state = initialState, action) {
	switch (action.type) {
		case 'AUTH_LOGIN_ERROR':
			return Object.assign({}, state, {
				loading: false
			})
		case 'AUTH_LOGIN_REQUEST':
			return Object.assign({}, state, {
				loggedIn: false,
				loading: true
			})
		case 'AUTH_LOGIN_SUCCESS':
			return Object.assign({}, state, {
				loggedIn: true,
				loading: false,
				token: action.token
			})
		case 'AUTH_LOGOUT_REQUEST':
			return Object.assign({}, state, {
				loggedIn: false,
				token: undefined
			})
		default:
			return state;
	}
}


export default update