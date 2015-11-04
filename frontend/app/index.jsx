import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import {Router, Route, Link, IndexRoute } from 'react-router';
import { createHistory } from 'history';

import members from './members';
import auth from './auth';

import MembersList from './membersList';
import MemberEdit from './memberEdit';
import MemberCreate from './memberCreate';

class Login extends React.Component {
  // // mixins: [ History ],
  // static contextTypes = {
  // 	history: RouterPropTypes.history
  // }

  constructor(props) {
  	super(props);

  	this.handleSubmit = this.handleSubmit.bind(this);
  	this.state = {
      error: false
    }
  }

  handleSubmit(event) {
    event.preventDefault()

    const name = this.state.name.value
    const password = this.state.password.value

    auth.login(name, password, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true })

      const { location } = this.props

      if (location.state && location.state.nextPathname) {
        this.history.replaceState(null, location.state.nextPathname)
      } else {
        this.history.replaceState(null, '/about')
      }
    })
  }

  onChange(name, value) {
  	this.state[name] = value;

  	this.setState(this.state);
  }

  render() {
    return (
      <form className='content' onSubmit={this.handleSubmit}>
      	<mdl.Card className='login mdl-color--white mdl-shadow--2dp'>
      		<mdl.CardTitle>Log in!</mdl.CardTitle>
			<div className="mdl-card__form">
		      	<mdl.Textfield 
		      		label="Naam" 
		      		onChange={value => this.onChange('name', value)} 
		      		floatingLabel />
		      	<div className="mdl-textfield mdl-js-textfield mdl-textfield__floating-label">
		      		<input 
		      			className="mdl-textfield__input" 
		      			onChange={e => this.onChange('password', e.target.value)} 
		      			type="password" 
		      			id="login-password" />
		      		<label className="mdl-textfield__label" htmlFor="login-password">Wachtwoord</label>
		      	</div>

				<mdl.Button primary raised colored>Verstuur</mdl.Button>
		        {this.state.error && (
		          <p>Bad login information</p>
		        )}
      		</div>
  		</mdl.Card>
      </form>
    )
  }
}


const Logout = React.createClass({
  componentDidMount() {
    auth.logout()
  },

  render() {
    return <p>You are now logged out</p>
  }
})


class App extends React.Component {

	constructor(props) {
		super(props);

		var member = members[0];

		this.state = {
			loggedIn: auth.loggedIn(),
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
		var {main, headerbar} = this.props.children || {};
		return (
			<mdl.Layout fixedHeader fixedDrawer>
				<mdl.Header >
					<mdl.HeaderRow>
						{ headerbar }
						<h3>Wolbodo:ledenlijst</h3>
					</mdl.HeaderRow>
				</mdl.Header>
				<mdl.Drawer>
					<header>
						<img src='logo.svg' />
					</header>

					<mdl.Navigation>
						{this.state.loggedIn ? [
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
			<IndexRoute components={{main: MembersList}} />

			<Route path="wijzig" components={{main: MemberEdit}} />
			<Route path="nieuw" components={{main: MemberCreate}} />
			<Route path="login" components={{main: Login}} />
			<Route path="logout" components={{main: Logout}} />
		</Route>
	</Router>,
	document.getElementById('app')
);