import Immutable from 'immutable'

let CONSTRUCT,
	AUTH_LOGIN_ERROR,
	AUTH_LOGIN_REQUEST,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGOUT_REQUEST

CONSTRUCT = () => Immutable.fromJS({
	loggedIn: false
})


AUTH_LOGIN_ERROR = (auth) => 
	auth.merge({
		loading: false
	})

AUTH_LOGIN_REQUEST = (auth) => 
	auth.merge({
		loggedIn: false,
		loading: true
	})

AUTH_LOGIN_SUCCESS = (auth, {data}) => {
	// get the userinfo from the token.
	let user = JSON.parse(
		atob(
			data.token
				  .split('.')[1]
				  .replace(/-/g, '+')
				  .replace(/_/g, '/')
		)
	)

	return auth.merge({
		loggedIn: true,
		loading: false,
		token: data.token,
		user: user
	})
}

AUTH_LOGOUT_REQUEST = (auth) => 
	auth.merge({
		loggedIn: false,
		token: undefined
	})

export {
	CONSTRUCT,
	AUTH_LOGIN_ERROR,
	AUTH_LOGIN_REQUEST,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGOUT_REQUEST
}