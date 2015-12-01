import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import {Router, Route, Link, IndexRoute, PropTypes } from 'react-router';
import { createHistory } from 'history';

// Reference static files so they are loaded with webpack.
import 'app.less';
import 'material';
import 'material.css';
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


// var myfont = require('fonts/muli');
// console.log(myfont); // { name: "Proxima Nova", files: [...] }


class HeaderBar extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(change) {
		// debugger;
	} 

	render() {

		var {location} = this.props;

		var mem = '';
		var url_parts = _(location.pathname.split('/'))
		 .slice(1)
		 .map(function (part) {
		 	mem = `${mem}/${part}`;

		 	return {
		 		name: part,
		 		path: mem
		 	};
		 })
		 .value();

		return (
			<div className='breadcrumbs'>
			{ url_parts.map((part, i) => (
				<Link key={part.name} to={part.path}>{_.startCase(part.name)}</Link>
			))}
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
						{ header }
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
			<IndexRoute components={{main: MemberView}} onEnter={Auth.auth.require}/>
			<Route path="lid-:id" components={{main: MemberEdit}} onEnter={Auth.auth.require} />
			<Route path="wijzig" components={{main: MemberEdit}} onEnter={Auth.auth.require} />
			<Route path="velden" components={{main: FieldsView}} onEnter={Auth.auth.require} />
			<Route path="velden/:veld" components={{main: FieldsEdit}} onEnter={Auth.auth.require} />
			<Route path="groepen" components={{main: GroupView}} onEnter={Auth.auth.require}> </Route>
			<Route path="groepen/:groep" components={{main: GroupEdit}} onEnter={Auth.auth.require} />
			<Route path="permissies" components={{main: PermissionView}} onEnter={Auth.auth.require} />
			<Route path="login" components={{main: Auth.Login}} />
			<Route path="logout" components={{main: Auth.Logout}} onEnter={Auth.auth.require} />
		</Route> 
		<Route path="/test" component={MemberEdit}/>
	</Router>,
	document.getElementById('app')
);