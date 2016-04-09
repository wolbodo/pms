import React, { PropTypes } from 'react';
import _ from 'lodash';

import Array from './array';

export default function Link({ value, displayValue, ...props }) {
  /* Shows a mapping of a one to many relationship */
  return (
    <Array
      value={_.map(value, (item) => _.get(item, _.toPath(displayValue)))}
      {...props}
    />
  );
}
Link.propTypes = {
  value: PropTypes.array,
  displayValue: PropTypes.string,
};

