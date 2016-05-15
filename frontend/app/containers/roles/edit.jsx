import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { ItemEdit } from 'components';
import * as roleActions from 'redux/modules/roles';

function RoleEdit({ roles, fields, params, auth, update }) {
  return (
    <ItemEdit
      schema={fields.items.roles}
      item={roles.items[params.groep]}
      permissions={auth.permissions.roles}
      onChange={(value, key) => update(params.groep, { [key]: value })}
    />
  );
}
RoleEdit.propTypes = {
  roles: PropTypes.object,
  fields: PropTypes.object,
  params: PropTypes.object,
  auth: PropTypes.object,
  update: PropTypes.func,
};

export default connect((state) => ({
  roles: state.get('roles').toJS(),
  fields: state.get('fields').toJS(),
  auth: state.get('auth').toJS(),
}), {
  update: roleActions.update
})(RoleEdit);
