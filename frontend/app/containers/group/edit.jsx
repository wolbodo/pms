import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { ItemEdit } from 'components';
import * as groupActions from 'redux/modules/groups';

function GroupEdit({ groups, fields, params, permissions, update }) {
  return (
    <ItemEdit
      schema={fields.items.roles}
      item={groups.items[params.groep]}
      permissions={permissions.leden.group}
      onChange={(value, key) => update(params.groep, { [key]: value })}
    />
  );
}
GroupEdit.propTypes = {
  groups: PropTypes.object,
  fields: PropTypes.object,
  params: PropTypes.object,
  permissions: PropTypes.object,
  update: PropTypes.func,
};

export default connect((state) => ({
  groups: state.get('groups').toJS(),
  fields: state.get('fields').toJS(),
  permissions: state.get('permissions').toJS()
}), {
  update: groupActions.update
})(GroupEdit);
