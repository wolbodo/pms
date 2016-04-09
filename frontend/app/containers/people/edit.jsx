import _ from 'lodash';
import React, { PropTypes } from 'react';
import { ItemEdit } from 'components';

import { connect } from 'react-redux';

import * as peopleActions from 'redux/modules/people';

function PersonEdit({ params, people, groups, fields, auth, update }) {
  const personId = params.id || auth.user.user;

  const permissions = (parseInt(personId, 10) === auth.user.user)
    ? _.merge({}, auth.permissions.people.self, auth.permissions.people)
    : auth.permissions.people;


  const person = _.get(people, ['items', personId], {});
  const updates = _.get(people, ['updates', personId]);
  // Find peson
  const item = _.assign({}, person, updates,
    { roles: _.filter(groups.items, (group) => _.includes(group.people_ids, person.id)) }
  );

  const schema = _.merge({}, fields.items.people, {
    properties: {
      roles: {
        type: 'link',
        title: 'Groepen',
        target: 'roles',
        displayValue: 'name',
      }
    }
  });
  schema.form[0].fields.push(['roles']);
  permissions.view.push('roles');

  return (
    <ItemEdit
      schema={schema}
      item={item}
      permissions={permissions}
      onChange={(value, key) => update(personId, value, key) }
    />
  );
}
PersonEdit.propTypes = {
  params: PropTypes.object,
  people: PropTypes.object,
  groups: PropTypes.object,
  fields: PropTypes.object,
  auth: PropTypes.object,
  update: PropTypes.func,
};

export default connect((state) => ({
  people: state.get('people').toJS(),
  groups: state.get('groups').toJS(),
  fields: state.get('fields').toJS(),
  auth: state.get('auth').toJS(),
}), {
  update: peopleActions.update
})(PersonEdit);
