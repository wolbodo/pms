import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import { connect } from 'react-redux';

import { change } from 'redux/modules/permissions';
import { Dialog, FlatButton } from 'material-ui';

import _ from 'lodash';

import { Link } from 'react-router';

class PermissionsDialog extends React.Component {
  static propTypes = {
    dialogState: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = props.dialogState;
  }
  componentWillReceiveProps(nextProps) {
    // Receiving props from upper component
    if (!_.isEqual(this.props.dialogState, nextProps.dialogState)) {
      this.setState(nextProps.dialogState || {
        schema: undefined,
        role: undefined,
        field: undefined,
        read: false,
        write: false
      });
    }
  }

  handleChange(type, value) {
    this.setState({
      [type]: value
    });
  }

  render() {
    const { onClose, onSubmit } = this.props;
    const { role, field, read, write } = this.state || {};

    const dialogOpen = role && field;

    const actions = [
      <FlatButton
        secondary
        label="Annuleren"
        onTouchTap={onClose}
      />,
      <FlatButton
        primary
        label="Opslaan"
        onTouchTap={() => onSubmit(this.state)}
      />,
    ];

    return (
      <Dialog
        title="Permissies wijzigen"
        className="permissions-dialog"
        actions={actions}
        open={!!dialogOpen}
        onRequestClose={onClose}
      >
        { !!dialogOpen && (
          <div>
            <p>
              Voor de personen in
              <span className="role">"{role.name}"</span>
              op het veld
              <span className="field">"{field.title}"</span>
            </p>
            <div className="switches">
              <div>
                <mdl.Switch
                  ripple
                  id="read"
                  checked={read}
                  onChange={({ target }) =>
                    this.handleChange('read', target.checked)
                  }
                >Lezen</mdl.Switch>
              </div>
              <div>
                <mdl.Switch
                  ripple
                  id="write"
                  checked={write}
                  onChange={({ target }) =>
                    this.handleChange('write', target.checked)
                  }
                >Wijzigen</mdl.Switch>
              </div>
            </div>
          </div>
      ) || (<div />)}
      </Dialog>
    );
  }
}

@connect((state) => ({ ...state.toJS() }), {
  change
})
export default class PermissionsView extends React.Component {
  static propTypes = {
    permissions: PropTypes.object,
    roles: PropTypes.object,
    fields: PropTypes.object,
    change: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {};
  }
  getPermissions(role, schema, field) {
    const { permissions } = this.props;
    const read = _.includes(_.get(permissions, [role.id, schema, 'read']), field.name);
    const write = _.includes(_.get(permissions, [role.id, schema, 'write']), field.name);

    return { read, write };
  }

  closeDialog() {
    this.setState({
      dialogState: undefined
    });
  }
  showDialog(state) {
    const { permissions } = this.props;
    this.setState({
      dialogState: _.assign(state, {
        read: _.includes(permissions[state.role.id][state.schema].read, state.field.name),
        write: _.includes(permissions[state.role.id][state.schema].write, state.field.name)
      })
    });
  }

  submitResult(result) {
    this.props.change(result);
    this.closeDialog();
  }

  renderHeading() {
    const { roles } = this.props;

    return (
      <thead>
        <tr>
          <th></th>
          {_.map(roles.items, (role, id) => (
            <th key={id} className="mdl-data-table__cell--non-numeric">
              <Link to={`/groepen/${id}`}>
                {role.name}
              </Link>
            </th>
          ))}
          <th></th>
          <th>Zelf</th>
        </tr>
      </thead>
    );
  }
  renderSchema(schema, key) {
    const { roles } = this.props;

    return [
      (<tr key={`heading-${key}`}>
        <th>{schema.name}</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>)
    ].concat(
      _.map(schema.properties, (field, i) => (
        <tr key={`${key}-${i}`}>
          <th>
            <Link to={`/velden/${field.name}`}>
              {field.title}
            </Link>
          </th>
          {_.map(roles.items, (role, j) =>
            (<td key={j}>
              <span
                className="permission"
                onClick={() => this.showDialog({ schema: key, role, field })}
              >
              { (({ read, write }) =>
                [read ? <i key={'read'} className="icon">visibility</i>
                    : <i key={'read'} className="icon dimmed">visibility_off</i>,
                  write ? <i key={'write'} className="icon">edit</i>
                      : <i key={'write'} className="icon dimmed">edit</i>
                ]
                )(this.getPermissions(role, key, field))
              }
              </span>
            </td>)
          )}
          <td></td>
          <td>
            <span
              className="permission"
              onClick={() => this.showDialog({ schema: key, role: 'self', field })}
            >
            { (({ read, write }) =>
              [read ? <i key="read" className="icon">visibility</i>
                  : <i key="read" className="icon dimmed">visibility_off</i>,
                write ? <i key="write" className="icon">edit</i>
                    : <i key="write" className="icon dimmed">edit</i>
              ]
              )(this.getPermissions('self', key, field))
            }
            </span>
          </td>
        </tr>
      ))
    );
  }
  renderBody() {
    const { fields } = this.props;
    return (
      <tbody>
        { _.map(fields.items, (schema, i) => this.renderSchema(schema, i)) }
      </tbody>
    );
  }

  render() {
    let { dialogState } = this.state;

    return (
      <mdl.Card className="content permissions mdl-color--white mdl-shadow--2dp">
        <mdl.CardTitle>
          Permissies
        </mdl.CardTitle>
        <mdl.CardText>
          <table className="mdl-data-table mdl-js-data-table">
            { this.renderHeading() }
            { this.renderBody() }
          </table>
          <PermissionsDialog
            dialogState={dialogState}
            onSubmit={(result) => this.submitResult(result)}
            onClose={() => this.closeDialog()}
          />
        </mdl.CardText>
      </mdl.Card>
    );
  }
}
