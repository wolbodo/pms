import _ from 'lodash';
import React, { PropTypes } from 'react';

import { SelectField } from 'material-ui';
import MenuItem from 'material-ui/lib/menus/menu-item';

export default function Enum({ title, value, permissions, options, onBlur }) {
  const style = {};

  return (
    <SelectField
      className="selectfield"
      floatingLabelText={ title }
      value={value}
      style={style}
      onChange={(ev, i, option) => onBlur(option)}
      disabled={!permissions.edit}
    >
    {_.map(options, (field, key) => (
      <MenuItem
        style={style}
        key={key}
        value={key}
        primaryText={field}
      />
    ))}
    </SelectField>
  );
}
Enum.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.object.isRequired,
  permissions: PropTypes.object,
  onBlur: PropTypes.func.isRequired,
};
