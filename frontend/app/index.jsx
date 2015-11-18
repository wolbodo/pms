import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import {Router, Route, Link, IndexRoute, PropTypes } from 'react-router';
import { createHistory } from 'history';

import {auth, Login, Logout} from './auth';

import MembersList from './membersList';
import MemberEdit from './memberEdit';
import MemberCreate from './memberCreate';


class HeaderBar extends React.Component {
	render() {
		return (
			<mdl.Button primary raised colored>Opslaan</mdl.Button>
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
		var {main, header} = this.props.children || {};
		return (
			<mdl.Layout fixedHeader fixedDrawer>
				<mdl.Header >
					<mdl.HeaderRow title="Wolbodo:ledenlijst">
						{ header }
					</mdl.HeaderRow>
				</mdl.Header>
				<mdl.Drawer>
					<header>
						<img src='logo.svg' />
					</header>

					<mdl.Navigation>
						{auth.loggedIn() ? [
							(<Link key="leden" to="/">Ledenlijst</Link>),
							(<Link key="wijzig" to="/wijzig">Wijzig gegevens</Link>),
						 	(<Link key="nieuw" to="/nieuw">Nieuw lid</Link>),
			              	(<Link key="logout" to="/logout">Log out</Link>)
			            ] : (
			              	<Link to="/login">Sign in</Link>
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
			<IndexRoute components={{main: MembersList}} onEnter={auth.require}/>

			<Route path="wijzig" components={{main: MemberEdit, header: HeaderBar}} onEnter={auth.require} />
			<Route path="nieuw" components={{main: MemberCreate, header: HeaderBar}} onEnter={auth.require} />
			<Route path="login" components={{main: Login}} />
			<Route path="logout" components={{main: Logout}} onEnter={auth.require} />
		</Route>
	</Router>,
	document.getElementById('app')
);