import React from 'react';
import { Route, IndexRoute } from 'react-router'

import {
	group,
	people,
	fields,
	permissions,
	Login,
	App,
	HeaderBar
} from 'containers'

import * as authActions from 'redux/modules/auth';

function requireLogin(store) {
  return (nextState, replaceState) => {
    const state = store.getState()

    if (!state.getIn(['auth', 'loggedIn'])) {
      replaceState('/login')
    }
  }
}

function logout(store) {
	return (nextState, replaceState) => {

    store.dispatch(authActions.logout())
    debugger;
		replaceState('/login')
	}
} 

export default (store) => {
 return (
	<Route path="/" component={App}>
		<IndexRoute
			name='Lijst'
			components={{main: people.View, header: HeaderBar}}
			onEnter={requireLogin(store)}/>
		<Route
			name="Mensen"
			path="mensen(/:group_name)"
			components={{main: people.View, header: HeaderBar}}
			onEnter={requireLogin(store)}/>
		<Route
			name="Lid"
			path="lid-:id"
			components={{main: people.Edit, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Wijzig"
			path="wijzig"
			components={{main: people.Edit, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Velden"
			path="velden"
			components={{main: fields.View, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Veld"
			path="velden/:veld"
			components={{main: fields.Edit, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Groepen"
			path="groepen"
			components={{main: group.View, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Groep"
			path="groepen/:groep"
			components={{main: group.Edit, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Permissies"
			path="permissies"
			components={{main: permissions.View, header: HeaderBar}}
			onEnter={requireLogin(store)} />
		<Route
			name="Login"      
			path="login"          
			components={{main: Login}} />
		<Route
			name="Logout"
			path="logout"
			onEnter={logout(store)} />
	</Route>
 )
};