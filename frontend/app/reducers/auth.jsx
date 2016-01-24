import constants from 'constants'

const initialState = {
	loggedIn: false
}

function update(state = initialState, action) {
	switch (action.type) {
		case constants.AUTH_LOGIN_ERROR:
			return Object.assign({}, state, {
				loading: false
			})
		case constants.AUTH_LOGIN_REQUEST:
			return Object.assign({}, state, {
				loggedIn: false,
				loading: true
			})
		case constants.AUTH_LOGIN_SUCCESS:
			// get the userinfo from the token.
			let t = action.token.split('.');
			let user = JSON.parse(
				atob(
					t[1].replace(/-/g, '+').replace(/_/g, '/')
				)
			)


			return Object.assign({}, state, {
				loggedIn: true,
				loading: false,
				token: action.token,
				user: user
			})
		case constants.AUTH_LOGOUT_REQUEST:
			return Object.assign({}, state, {
				loggedIn: false,
				token: undefined
			})
		default:
			return state;
	}
}


export default update