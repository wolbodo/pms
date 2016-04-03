import _ from 'lodash'
import Immutable from 'immutable'

const reducers = {
	CONSTRUCT: () => Immutable.fromJS({
		loggedIn: false
	}),

	AUTH_LOGIN_ERROR: (auth) => 
		auth.merge({
			loading: false
		}),

	AUTH_LOGIN_REQUEST: (auth) => 
		auth.merge({
			loggedIn: false,
			loading: true
		}),

	AUTH_LOGIN_SUCCESS: (auth, {data}) => {
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
	},

	AUTH_LOGOUT_REQUEST: (auth) => 
		reducers.CONSTRUCT()
}

export default (state = reducers.CONSTRUCT(), action) => {
  let reducer = _.get(reducers, action.type);
  if (reducer) {
    return reducer(state, action);
  } 
  return state;
}