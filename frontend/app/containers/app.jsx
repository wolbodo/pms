import _ from 'lodash';

import React from 'react';
import { connect } from 'react-redux';
import * as mdl from 'react-mdl'
import { Link } from 'react-router';

import {people, auth} from 'actions'

import logo from 'img/logo.svg';


class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			currentPage: 0
		}

		this.handleTab = this.handleTab.bind(this);
		this.setPage = this.setPage.bind(this);
	}

	componentDidMount() {

		const { dispatch } = this.props

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
		var {main, header, auth} = this.props;
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
						{auth.loggedIn ? [
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


function mapStateToProps(state) {
  return {
    auth: state.app.get('auth').toJS()
  }
}



export default connect(mapStateToProps)(App);