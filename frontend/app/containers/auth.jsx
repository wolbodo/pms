import React from 'react';
import * as mdl from 'react-mdl'

import { PropTypes } from 'react-router';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux'

import actions from 'actions';

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


    const {dispatch} = this.props

    dispatch(actions.auth.login(this.state.name, this.state.password))

    // auth.login(name, password, (loggedIn) => {

    //   if (!loggedIn)
    //     return this.setState({ error: true })

    //   const { location } = this.props

    //   if (location.state && location.state.nextPathname) {
    //     this.context.history.replaceState(null, location.state.nextPathname)
    //   } else {
    //     this.context.history.replaceState(null, '/')
    //   }
    // })
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

class Logout extends React.Component {
  // mixins: [ History ],
  static contextTypes = {
    history: PropTypes.history
  };

  componentDidMount() {
    const {dispatch} = this.props;

    dispatch(actions.auth.logout());
    dispatch(routeActions.push('/login'))
  }

  render() {
    return <p>You are now logged out</p>
  }
}

function mapStateToProps(state) {
  const members = state.app.get('members').toJS()
  const isFetching = false

  return {
    members,
    isFetching
  }
}


export default {
  Login : connect(mapStateToProps)(Login),
  Logout : connect(mapStateToProps)(Logout)
}

