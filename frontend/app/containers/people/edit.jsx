import _ from 'lodash';
import React, { PropTypes } from 'react';
import { ItemEdit } from 'components';
import * as schemaUtil from 'schema';

import { connect } from 'react-redux';

import * as peopleActions from 'redux/modules/people';

function PersonEdit({ params, people, roles, fields, auth, update }) {
  const personId = params.id || auth.user.user;

  const permissions = (parseInt(personId, 10) === auth.user.user)
    ? _.merge({}, auth.permissions.people.self, auth.permissions.people)
    : auth.permissions.people;


  const person = _.get(people, ['items', personId], {});
  const updates = _.get(people, ['updates', personId]);
  const schema = _.get(fields, 'items.people');

  // Find all resources referenced in the schema
  const resources = schemaUtil.getResources({ people, roles }, schema);

  const item = _.mergeWith(
    person, updates,
    (obj, src) => (_.isArray(obj) ? src : undefined)
  );

  return (
    <ItemEdit
      schema={schema}
      resources={resources}
      item={item}
      permissions={permissions}
      onChange={(value, key) => update(personId, value, key) }
    />
  );
}

PersonEdit.propTypes = {
  params: PropTypes.object,
  people: PropTypes.object,
  roles: PropTypes.object,
  fields: PropTypes.object,
  auth: PropTypes.object,
  update: PropTypes.func,
};

export default connect((state) => ({
  people: state.get('people').toJS(),
  roles: state.get('roles').toJS(),
  fields: state.get('fields').toJS(),
  auth: state.get('auth').toJS(),
}), {
  update: peopleActions.update
})(PersonEdit);
