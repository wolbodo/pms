import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';

// import { Link } from 'react-router';

import { connect } from 'react-redux';

import * as authActions from 'redux/modules/auth';

@connect(
  (state) => ({
    people: state.get('people').toJS(),
    auth: state.get('auth').toJS()
  }), {
    login: authActions.login,
    passwordForgot: authActions.passwordForgot
  })
export default class Login extends React.Component {
  static propTypes = {
    login: PropTypes.func,
    passwordForgot: PropTypes.func,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      error: false
    };
  }

  onChange(name, value) {
    this.setState({
      ...this.state,
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.login(this.state.email, this.state.password);
  }

  render() {
    const { auth: { error, success } } = this.props;
    return (
      <form className="content" onSubmit={this.handleSubmit}>
        <mdl.Card className="login mdl-color--white mdl-shadow--2dp">
          <mdl.CardTitle>Log in!</mdl.CardTitle>
          <div className="mdl-card__form">
            <mdl.Textfield
              label="Email"
              onChange={({ target }) => this.onChange('email', target.value)}
              pattern=".+@.+"
              error="Input is not an emailaddress!"
              floatingLabel
            />
            <mdl.Textfield
              label="Wachtwoord"
              type="password"
              onChange={({ target }) => this.onChange('password', target.value)}
              floatingLabel
            />
            <mdl.Button primary raised>Log in</mdl.Button>
            {success
              ? (<p className="success">{success}</p>)
              : (error && (<p className="error">{error}</p>))
            }
            <a href=""
              onClick={(ev) => {
                ev.preventDefault();
                this.props.passwordForgot(this.state.email);
              }}
            >Wachtwoord vergeten?</a>
          </div>
      </mdl.Card>
      </form>
    );
  }
}
