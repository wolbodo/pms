import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as mdl from 'react-mdl';
import { Link } from 'react-router';

// Action imports
import { push } from 'react-router-redux';

import logo from 'img/logo.svg'; // eslint-disable-line

@connect(
  (state) => ({
    auth: state.get('auth').toJS(),
  }), {
    pushState: push,
  })
export default class App extends React.Component {
  static propTypes = {
    main: PropTypes.element,
    header: PropTypes.element,

    auth: PropTypes.object,
    people: PropTypes.object,
    fields: PropTypes.object,
    roles: PropTypes.object,

    pushState: PropTypes.func,
  }
  constructor(props) {
    super(props);

    this.state = { infoOpen: false };
  }

  componentWillReceiveProps(nextProps) {
    const { auth, pushState } = this.props;

    // Auth flow
    if (!auth.loggedIn && nextProps.auth.loggedIn) {
      // login
      pushState('/');
    } else if (auth.loggedIn && !nextProps.auth.loggedIn) {
      // logout
      pushState('/login');
    }
  }

  render() {
    const { main, header, auth } = this.props;

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
              (<Link key="mensen" to="/mensen">Mensen</Link>),
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

