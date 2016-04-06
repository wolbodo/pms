
import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash';
import { connect } from 'react-redux';

import * as peopleActions from 'redux/modules/people';
import * as groupsActions from 'redux/modules/groups';
import * as fieldsActions from 'redux/modules/fields';

import { Dialog, FlatButton } from 'material-ui';

@connect((state) => ({ ...state.toJS() }), {
  peopleCommit: peopleActions.commit,
  peopleRevert: peopleActions.revert,
  peopleCreate: peopleActions.create,
  groupCreate: groupsActions.create,
  fieldCreate: fieldsActions.create,
})
export default class HeaderBar extends React.Component {
  static propTypes = {
    people: PropTypes.object,
    groups: PropTypes.object,
    fields: PropTypes.object,
    route: PropTypes.object,
    auth: PropTypes.object,
    peopleCreate: PropTypes.func,
    peopleRevert: PropTypes.func,
    peopleCommit: PropTypes.func,
    groupCreate: PropTypes.func,
    fieldCreate: PropTypes.func,
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
    const { people, groups } = this.props;
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
      { !_.isEmpty(groups.updates) && (
        <div>
          <h6>Groepen</h6>
          <ul>
            {_.map(groups.updates, (group, id) => (
              <li key={id}>
                <p>{groups.items[id].name} Gewijzigd</p>
                <ul>
                  {_.map(group, (value, key) => (
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
      people, groups, fields,
      peopleCommit, peopleRevert, peopleCreate,
      groupCreate, fieldCreate, route
    } = this.props;
    const changed = (
      !_.isEmpty(people.updates) ||
      !_.isEmpty(groups.updates) ||
      !_.isEmpty(fields.updates)
    );

    return (
      <div className="headerBar">
      {changed && (
        <mdl.Button
          ripple
          id="header-save-button"
          onClick={() => peopleCommit()}
        >
          Opslaan
        </mdl.Button>
      )}
      {changed && (
        <mdl.Button
          ripple
          colored
          onClick={() => peopleRevert()}
        >
          Annuleren
        </mdl.Button>
      )}
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
          onClick={() => groupCreate()}
        >
          Nieuwe groep
        </mdl.Button>
      )}
      {route.name === 'Velden' && (
        <mdl.Button
          className="action end"
          ripple
          onClick={() => fieldCreate()}
        >
          Nieuw veld
        </mdl.Button>
      )}

      </div>
    );
  }
}
