import React from 'react';
import * as mdl from 'react-mdl'

import { PropTypes } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux'

import actions from 'actions';

@connect(
  state => ({
    people: state.get('people').toJS()
  }), 
  { login: actions.auth.login })
class Login extends React.Component {
  // mixins: [ History ],
  static contextTypes = {
    history: PropTypes.history
  };

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      error: false
    }
  }

  handleSubmit(event) {
    event.preventDefault()

    this.props.login(this.state.name, this.state.password)
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
              onChange={e => this.onChange('name', e.target.value)} 
              floatingLabel />
            <mdl.Textfield 
              label="Wachtwoord" 
              type="password"
              onChange={e => this.onChange('password', e.target.value)} 
              floatingLabel />

          <mdl.Button primary raised>Verstuur</mdl.Button>
            {this.state.error && (
              <p>Bad login information</p>
            )}
          </div>
      </mdl.Card>
      </form>
    )
  }
}

@connect(
  state => ({
    people: state.get('people').toJS()
  }), 
  {
    push,
    logout: actions.auth.logout
  })
class Logout extends React.Component {
  // mixins: [ History ],
  static contextTypes = {
    history: PropTypes.history
  };

  componentDidMount() {
    const {push, logout} = this.props;

    logout();
    push('/login')
  }

  render() {
    return <p>You are now logged out</p>
  }
}

export default {
  Login, Logout
}

