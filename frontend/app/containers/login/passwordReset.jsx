import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
// import { Link } from 'react-router';

import { connect } from 'react-redux';

import * as authActions from 'redux/modules/auth';

// const PasswordReset = ({ params: { token } }) => (
//   <div>Password reset {token} </div>
// );
// PasswordReset.propTypes = {
//   params: PropTypes.object,
// };

@connect(
  (state) => ({
    auth: state.get('auth').toJS()
  }), {
    passwordReset: authActions.passwordReset
  })
export default class PasswordReset extends React.Component {
  static propTypes = {
    passwordReset: PropTypes.func,
    params: PropTypes.object,
    auth: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  onChange(name, value) {
    this.setState({
      ...this.state,
      [name]: value
    });
  }

  handleSubmit() {
    const { token } = this.props.params;

    this.props.passwordReset(token, this.state.password);
  }

  render() {
    const { auth: { error, success } } = this.props;
    return (
      <form className="content" onSubmit={(ev) => {ev.preventDefault(); this.handleSubmit();}}>
        <mdl.Card className="login mdl-color--white mdl-shadow--2dp">
          <mdl.CardTitle>Stel je nieuwe wachtwoord in!</mdl.CardTitle>
          <div className="mdl-card__form">
            <mdl.Textfield
              label="Wachtwoord"
              type="password"
              onChange={({ target }) => this.onChange('password', target.value)}
              floatingLabel
            />
            <mdl.Button primary raised>Verstuur</mdl.Button>
            {success
              ? (<p className="success">{success}</p>)
              : (error && (<p className="error">{error}</p>))
            }
          </div>
      </mdl.Card>
      </form>
    );
  }
}
