import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl';

import { connect } from 'react-redux';

import { Field } from 'components';

import * as rolesActions from 'redux/modules/roles';
import * as fieldsActions from 'redux/modules/fields';

@connect((state) => ({
  auth: state.get('auth').toJS(),
  roles: state.get('roles').toJS(),
  people: state.get('people').toJS(),
  fields: state.get('fields').toJS(),
}), {
  fieldsFetch: fieldsActions.fetch,
  rolesFetch: rolesActions.fetch,
  rolesUpdate: rolesActions.update,
})
export default class RoleView extends React.Component {
  static propTypes = {
    auth: PropTypes.object,
    roles: PropTypes.object,
    people: PropTypes.object,
    fields: PropTypes.object,
    fieldsFetch: PropTypes.func,
    rolesFetch: PropTypes.func,
    rolesUpdate: PropTypes.func,
  }
  componentDidMount() {
    this.props.fieldsFetch();
    this.props.rolesFetch();
  }

  componentDidUpdate(prevProps) {
    const { roles } = this.props;

    if (_.keys(roles.items).length > _.keys(prevProps.roles.items).length) {
      // Scroll to bottom
      const node = ReactDOM.findDOMNode(this);
      node.lastChild.scrollIntoView();
    }
  }

  render() {
    const {
      roles: { items, updates }, rolesUpdate,
      auth: { permissions },
      people,
      fields } = this.props;

    const schema = _.get(fields, 'items.roles');

    const roles = _.merge(items, updates);
    const editFields = ['description'];

    return (
      <div className="content">
      {_.map(roles, (role) => (
        <mdl.Card
          key={role.id}
          className="mdl-color--white mdl-shadow--2dp"
        >
          <mdl.CardTitle>
            {role.name}
          </mdl.CardTitle>
          <div className="fieldset">
            {_.map(editFields, (field) => (
              <Field
                key={field}
                field={_.get(schema.properties, field)}
                disabled={!_.includes(permissions.roles.edit, field)}
                onChange={(value) => rolesUpdate(role.id, { [field]: value })}
                value={role[field]}
              />
            ))}
          </div>
          <div className="people">
            <Field
              value={_.map(role.people_ids, (id) => _.get(people.items, id))}
              onBlur={(value, key) => console.log('blur', value, key)}
              onChange={(value, key) => console.log('change', value, key)}
              field={{
                type: 'link',
                title: 'Mensen',
                name: 'people',
                target: 'people',
                displayValue: 'nickname',
                options: people.items,
              }}
            />
          </div>
        </mdl.Card>
      ))}
      </div>
    );
  }
}
