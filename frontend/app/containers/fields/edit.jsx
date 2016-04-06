// import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import * as fieldActions from 'redux/modules/fields';

import { ItemEdit } from 'components';


function FieldsEdit({ params, fields, permissions, updateField }) {
  return (
    <ItemEdit
      schema={fields.schemas.field}
      permissions={permissions.leden.field}
      item={fields.schemas.person.fields[params.veld]}
      onChange={(value, key) => updateField('person', params.veld, { [key]: value }) }
    />
  );
}
FieldsEdit.propTypes = {
  params: PropTypes.object,
  fields: PropTypes.object,
  permissions: PropTypes.object,
  updateField: PropTypes.func
};

export default connect((state) => ({
  fields: state.get('fields').toJS(),
  permissions: state.get('permissions').toJS()
}), {
  ...fieldActions
})(FieldsEdit);
