import React from 'react';
import { Route, IndexRoute } from 'react-router'

import {
	HeaderBar
} from 'containers'

import {
	group,
	member,
	fields,
	permissions,
	Auth,
	App
} from 'containers'

import actions from 'actions'

export default (store) => {
 return (
	<Route path="/" component={App}>
		<IndexRoute
			name='Lijst'
			components={{main: member.View, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)}/>
		<Route
			name="Lid"
			path="lid-:id"
			components={{main: member.Edit, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Wijzig"
			path="wijzig"
			components={{main: member.Edit, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Velden"
			path="velden"
			components={{main: fields.View, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Veld"
			path="velden/:veld"
			components={{main: fields.Edit, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Groepen"
			path="groepen"
			components={{main: group.View, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Groep"
			path="groepen/:groep"
			components={{main: group.Edit, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Permissies"
			path="permissies"
			components={{main: permissions.View, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
		<Route
			name="Login"      
			path="login"          
			components={{main: Auth.Login, header: HeaderBar}} />
		<Route
			name="Logout"
			path="logout"
			components={{main: Auth.Logout, header: HeaderBar}}
			onEnter={actions.auth.requireLogin(store)} />
	</Route>
 )
};