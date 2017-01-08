import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';

import { connect } from 'react-redux';

import * as authActions from 'redux/modules/auth';

@connect(
  (state) => ({
    people: state.get('people').toJS(),
    auth: state.get('auth').toJS()
  }),
  { login: authActions.login })
export default class Login extends React.Component {
  static propTypes = {
    login: PropTypes.func,
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
    this.state[name] = value;

    this.setState(this.state);
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.login(this.state.name, this.state.password);
  }

  render() {
    const { auth: { error } } = this.props;
    return (
      <form className="content" onSubmit={this.handleSubmit}>
        <mdl.Card className="login mdl-color--white mdl-shadow--2dp">
          <mdl.CardTitle>Log in!</mdl.CardTitle>
          <div className="mdl-card__form">
            <mdl.Textfield
              label="Naam"
              onChange={({ target }) => this.onChange('name', target.value)}
              floatingLabel
            />
            <mdl.Textfield
              label="Wachtwoord"
              type="password"
              onChange={({ target }) => this.onChange('password', target.value)}
              floatingLabel
            />
            <mdl.Button primary raised>Log in</mdl.Button>
            {error && (
              <p className="error">{error}</p>
            )}
            <a onClick={() => {}}>Wachtwoord vergeten?</a>
          </div>
      </mdl.Card>
      </form>
    );
  }
}
