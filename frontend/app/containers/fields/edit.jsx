// import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import * as fieldActions from 'redux/modules/fields';

import { ItemEdit } from 'components';


function FieldsEdit({ params, fields, auth, updateField }) {
  return (
    <ItemEdit
      schema={fields.items.fields}
      permissions={auth.permissions.fields}
      item={fields.items.fields[params.veld]}
      onChange={(value, key) => updateField('person', params.veld, { [key]: value }) }
    />
  );
}
FieldsEdit.propTypes = {
  params: PropTypes.object,
  fields: PropTypes.object,
  auth: PropTypes.object,
  updateField: PropTypes.func
};

export default connect((state) => ({
  fields: state.get('fields').toJS(),
  auth: state.get('auth').toJS()
}), {
  ...fieldActions
})(FieldsEdit);
