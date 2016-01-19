

import _ from 'lodash';

import React from 'react';
import mdl from 'react-mdl';
import { Link } from 'react-router';

import Auth from 'auth';

// Reference static files so they are loaded with webpack.
import 'app.less';
import 'material';
import 'material.css';
import 'favicon.png';
import logo from 'img/logo.svg';


export default class App extends React.Component {

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