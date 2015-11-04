import React from 'react';
import { PropTypes } from 'react-router';
import mdl from 'react-mdl';

var localStorage = window.localStorage;

var auth = {
  login(email, pass, callback) {

    if (localStorage.token) {
      if (callback) callback(true)
      this.onChange(true)
      return
    }
    pretendRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token
        if (callback) callback(true)
        this.onChange(true)
      } else {
        if (callback) callback(false)
        this.onChange(false)
      }
    })
  },

  getToken() {
    return localStorage.token
  },

  logout(callback) {
    delete localStorage.token
    if (callback) callback()
    this.onChange(false)
  },

  loggedIn() {
    return !!localStorage.token
  },


  require(nextState, replaceState) {
    if (!auth.loggedIn())
      replaceState({ nextPathname: nextState.location.pathname }, '/login')
  },



  onChange() {}
}

function pretendRequest(email, pass, callback) {
  setTimeout(() => {
    if (email === 'test' && pass === 'test') {
      callback({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      })
    } else {
      callback({ authenticated: false })
    }
  }, 0)
}


class Login extends React.Component {
  // mixins: [ History ],
  static contextTypes = {
    history: PropTypes.history
  }

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      error: false
    }
  }

  handleSubmit(event) {
    event.preventDefault()


    const name = this.state.name
    const password = this.state.password

    auth.login(name, password, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true })

      const { location } = this.props

      if (location.state && location.state.nextPathname) {
        this.context.history.replaceState(null, location.state.nextPathname)
      } else {
        this.context.history.replaceState(null, '/')
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
            <mdl.Textfield 
              label="Wachtwoord" 
              type="password"
              onChange={value => this.onChange('password', value)} 
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
  }

  componentDidMount() {
    auth.logout();

    this.context.history.replaceState(null, '/')
  }

  render() {
    return <p>You are now logged out</p>
  }
}




export default {
  auth : auth,
  Login : Login,
  Logout : Logout
}

