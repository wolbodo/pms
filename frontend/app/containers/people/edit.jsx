import _ from 'lodash';
import React, { PropTypes } from 'react';
import { ItemEdit } from 'components';

import { connect } from 'react-redux';

import * as peopleActions from 'redux/modules/people';

function PersonEdit({ params, people, fields, auth, update }) {
  const personId = params.id || auth.user.user;

  const permissions = (parseInt(personId, 10) === auth.user.user)
    ? _.merge({}, auth.permissions.people.self, auth.permissions.people)
    : auth.permissions.people;

  // Find peson
  const item = _.assign(
    _.get(people, ['items', personId], {}),
    _.get(people, ['updates', personId])
  );

  return (
    <ItemEdit
      schema={fields.items.people}
      item={item}
      permissions={permissions}
      onChange={(value, key) => update(personId, value, key) }
    />
  );
}
PersonEdit.propTypes = {
  params: PropTypes.object,
  people: PropTypes.object,
  fields: PropTypes.object,
  auth: PropTypes.object,
  update: PropTypes.func,
};

export default connect((state) => ({
  people: state.get('people').toJS(),
  fields: state.get('fields').toJS(),
  auth: state.get('auth').toJS(),
}), {
  update: peopleActions.update
})(PersonEdit);
