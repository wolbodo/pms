import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl';

import { Field } from 'components';

import { connectResources, PeopleResource, RolesResource } from 'resources';

@connectResources({
  people: PeopleResource,
  roles: RolesResource,
})
export default class RoleView extends React.Component {
  static propTypes = {
    roles: PropTypes.object,
    people: PropTypes.object,
  }

  componentDidUpdate(prevProps) {
    const { roles } = this.props;

    if (roles.size > prevProps.roles.size) {
      // Scroll to bottom
      const node = ReactDOM.findDOMNode(this);
      node.lastChild.scrollIntoView();
    }
  }

  render() {
    const { roles } = this.props;

    const editFields = ['description'];

    return (
      <div className="content">
      {roles.map((role) => (
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
                field={roles.getSchemaForField(field)}
                permissions={roles.getPermissionsForField(role.id, field)}
                onChange={(value) => roles.updateItem(role.id, value, field)}
                value={role[field]}
              />
            ))}
          </div>
          <div className="people">
            <Field
              value={role.members()}
              onBlur={(value, key) => console.log('blur', value, key)}
              onChange={(value) => roles.updateItem(role.id, value, 'members')}
              permissions={roles.getPermissionsForField(role.id, 'members')}
              resource={roles.getReferencedResource('members')}
              field={roles.getSchemaForField('members')}
            />
          </div>
        </mdl.Card>
      ))}
      </div>
    );
  }
}
