import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';
import update from 'react/lib/update';

import {Router, Route, Link, IndexRoute, PropTypes } from 'react-router';
import { createHistory } from 'history';

// Reference static files so they are loaded with webpack.
import 'app.less';
import 'material';
import 'material.css';
import 'favicon.png';
import logo from 'img/logo.svg';

import injectTapEventPlugin from "react-tap-event-plugin";

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


import Auth from 'auth';

import GroupView from 'group/view';
import GroupEdit from 'group/edit';

import MemberView from 'member/view';
import MemberEdit from 'member/edit';

import FieldsView from 'fields/view';
import FieldsEdit from 'fields/edit';

import PermissionView from 'permissions/table';


class HeaderBar extends React.Component {
	constructor(props) {
		super(props);

	}

	componentDidMount() {
	}

	render() {
		return (
			<div className='breadcrumbs'>
			</div>
		);
	}
}

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			currentPage: 0
		}

		this.handleTab = this.handleTab.bind(this);
		this.setPage = this.setPage.bind(this);
	}

	handleTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	setPage(page) {
		return () => 
			this.setState({
				currentPage: page
			});
	}

	render() {
		var {main, header} = this.props || {};
		return (
			<mdl.Layout fixedHeader fixedDrawer>
				<mdl.Header >
					<mdl.HeaderRow>
						{header}
					</mdl.HeaderRow>
				</mdl.Header>
				<mdl.Drawer>
					<header>
						<img src={logo} />
					</header>

					<mdl.Navigation>
						{Auth.auth.loggedIn() ? [
							(<Link key="leden" to="/">Leden</Link>),
							(<Link key="wijzig" to="/wijzig">Wijzig gegevens</Link>),
						 	(<Link key="velden" to="/velden">Velden</Link>),
						 	(<Link key="groepen" to="/groepen">Groepen</Link>),
						 	(<Link key="permissies" to="/permissies">Permissies</Link>),
			              	(<Link key="logout" to="/logout">Log uit</Link>)
			            ] : (
			              	<Link to="/login">Log in</Link>
			            )}
					</mdl.Navigation>
				</mdl.Drawer>
				<mdl.Content className="mdl-color--grey-100">
					{main}
				</mdl.Content>
			</mdl.Layout>

		);
	}
}

ReactDOM.render(
	<Router history={createHistory()}>
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
	</Router>,
	document.getElementById('app')
);