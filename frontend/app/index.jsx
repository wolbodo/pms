import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import update from 'react/lib/update';

import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router';
import { syncHistory, routeReducer } from 'redux-simple-router'
import { createHistory } from 'history';
import injectTapEventPlugin from "react-tap-event-plugin";

import Auth from 'auth';
import App from 'app';
import HeaderBar from 'headerBar';
import GroupView from 'group/view';
import GroupEdit from 'group/edit';
import MemberView from 'member/view';
import MemberEdit from 'member/edit';
import FieldsView from 'fields/view';
import FieldsEdit from 'fields/edit';
import PermissionView from 'permissions/table';

import reducers from './reducers'


// Debug;
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';


const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-k'
               changePositionKey='ctrl-m'>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

const history = createHistory();
const middleware = syncHistory(history);
const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}));


const finalCreateStore = compose(
  applyMiddleware(middleware),
  DevTools.instrument()
)(createStore);
const store = finalCreateStore(reducer);
middleware.listenForReplays(store);

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


ReactDOM.render(

	<Provider store={store}>
		<div>
		<Router history={history}>
			<Route path="/" component={App}>
				<IndexRoute name='Lijst'      components={{main: MemberView, header: HeaderBar}} onEnter={Auth.auth.require}/>
				<Route      name="Lid"        path="lid-:id"        components={{main: MemberEdit, header: HeaderBar}}     onEnter={Auth.auth.require} />
				<Route      name="Wijzig"     path="wijzig"         components={{main: MemberEdit, header: HeaderBar}}     onEnter={Auth.auth.require} />
				<Route      name="Velden"     path="velden"         components={{main: FieldsView, header: HeaderBar}}     onEnter={Auth.auth.require} />
				<Route      name="Veld"       path="velden/:veld"   components={{main: FieldsEdit, header: HeaderBar}}     onEnter={Auth.auth.require} />
				<Route      name="Groepen"    path="groepen"        components={{main: GroupView, header: HeaderBar}}      onEnter={Auth.auth.require} />
				<Route      name="Groep"      path="groepen/:groep" components={{main: GroupEdit, header: HeaderBar}}      onEnter={Auth.auth.require} />
				<Route      name="Permissies" path="permissies"     components={{main: PermissionView, header: HeaderBar}} onEnter={Auth.auth.require} />
				<Route      name="Login"      path="login"          components={{main: Auth.Login, header: HeaderBar}}     />
				<Route      name="Logout"     path="logout"         components={{main: Auth.Logout, header: HeaderBar}}    onEnter={Auth.auth.require} />
			</Route> 
			<Route path="/test" component={MemberEdit}/>
		</Router>
	    <DevTools />
		</div>
	</Provider>,
	document.getElementById('app')
);