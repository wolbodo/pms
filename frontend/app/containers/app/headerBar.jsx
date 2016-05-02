
import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash';
import { connect } from 'react-redux';

import * as peopleActions from 'redux/modules/people';
import * as rolesActions from 'redux/modules/roles';
import * as fieldsActions from 'redux/modules/fields';

import { Dialog, FlatButton } from 'material-ui';

@connect((state) => ({ ...state.toJS() }), {
  peopleCommit: peopleActions.commit,
  peopleRevert: peopleActions.revert,
  peopleCreate: peopleActions.create,
  peopleFetch: peopleActions.fetch,
  rolesCreate: rolesActions.create,
  rolesFetch: rolesActions.fetch,
  rolesCommit: rolesActions.commit,
  rolesRevert: rolesActions.revert,
  fieldsCreate: fieldsActions.create,
  fieldsFetch: fieldsActions.fetch,
})
export default class HeaderBar extends React.Component {
  static propTypes = {
    people: PropTypes.object,
    roles: PropTypes.object,
    fields: PropTypes.object,
    route: PropTypes.object,
    auth: PropTypes.object,
    peopleCreate: PropTypes.func,
    peopleFetch: PropTypes.func,
    peopleRevert: PropTypes.func,
    peopleCommit: PropTypes.func,
    rolesCreate: PropTypes.func,
    rolesFetch: PropTypes.func,
    rolesCommit: PropTypes.func,
    rolesRevert: PropTypes.func,
    fieldsCreate: PropTypes.func,
    fieldsFetch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false
    };
  }

  showDialog() {
    this.setState({
      dialogOpen: true
    });
  }
  closeDialog() {
    this.setState({
      dialogOpen: false
    });
  }

  // Deprecated: but useful for modals and such
  renderDialog() {
    const { people, roles } = this.props;
    const { dialogOpen } = this.state;

    const actions = [
      <FlatButton
        secondary
        label="Annuleren"
        onTouchTap={() => this.closeDialog()}
      />,
      <FlatButton
        primary
        label="Opslaan"
        onTouchTap={() => this.closeDialog()}
      />,
    ];

    return (
      <Dialog
        title="Opslaan wijzigingen"
        className="change-dialog"
        actions={actions}
        modal={false}
        open={dialogOpen}
        onRequestClose={() => this.closeDialog()}
      >
      { !_.isEmpty(people.updates) && (
        <div>
          <h6>Leden</h6>
          <ul>
            {_.map(people.updates, (person, id) => (
              <li key={id}>
                <p>{people.items[id].nickname} Gewijzigd</p>
                <ul>
                  {_.map(person, (value, key) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      { !_.isEmpty(roles.updates) && (
        <div>
          <h6>Groepen</h6>
          <ul>
            {_.map(roles.updates, (role, id) => (
              <li key={id}>
                <p>{roles.items[id].name} Gewijzigd</p>
                <ul>
                  {_.map(role, (value, key) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      </Dialog>
    );
  }

  render() {
    const {
      people, roles, fields,
      peopleCommit, peopleRevert, peopleCreate,
      rolesCreate, rolesRevert, rolesCommit, fieldsCreate, route
    } = this.props;

    const { peopleFetch, rolesFetch, fieldsFetch } = this.props;

    // Figure out current state.
    const sets = [people, roles, fields];
    let apiState = undefined;

    if (_.some(sets, (set) => set.fetching)) {
      // Loading
      apiState = (
        <mdl.Spinner style={{ marginRight: '1em' }} />
      );
    } else if (_.some(sets, (set) => set.pushing)) {
      // Sending
      apiState = (
        <mdl.Spinner style={{ marginRight: '1em' }} />
      );
    } else if (_.some(sets, (set) => !_.isEmpty(set.updates))) {
      // Changes
      apiState = (
        <div>
          <mdl.IconButton raised name="save"
            onClick={ () => {
              peopleCommit();
              rolesCommit();
            }}
          />
          <mdl.IconButton raised name="undo"
            onClick={ () => {
              peopleRevert();
              rolesRevert();
            }}
          />
        </div>);
    } else if (_.some(sets, (set) => set.conflict)) {
      // Error (popup)
      apiState = (
        <mdl.IconButton raised name="error"
          onClick={ () => {
            peopleFetch();
            rolesFetch();
            fieldsFetch();
          }}
        />);
    } else if (_.every(sets, (set) => set.loaded)) {
      // Loaded
      apiState = (
        <mdl.IconButton raised name="cloud download"
          onClick={ () => {
            peopleFetch();
            rolesFetch();
            fieldsFetch();
          }}
        />);
    }

    // let error = null;
    // if (_.some(sets, (set) => !_.isEmpty(set.error))) {
    //   error = 'error';
    // }

    return (
      <div className="headerBar">
      {apiState}
      <div className="spacer"></div>
      {route.name === 'Mensen' && (
        <mdl.Button
          className="action end"
          ripple
          onClick={() => peopleCreate()}
        >
          Nieuw persoon
        </mdl.Button>
      )}
      {route.name === 'Groepen' && (
        <mdl.Button
          className="action end"
          ripple
          onClick={() => rolesCreate()}
        >
          Nieuwe groep
        </mdl.Button>
      )}
      {route.name === 'Velden' && (
        <mdl.Button
          className="action end"
          ripple
          onClick={() => fieldsCreate()}
        >
          Nieuw veld
        </mdl.Button>
      )}

      </div>
    );
  }
}
