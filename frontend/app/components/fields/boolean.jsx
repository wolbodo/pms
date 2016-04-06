import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Boolean extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    label: 'Boolean'
  };

  render() {
    const { label, value, disabled,
        onChange, onBlur } = this.props;

    return (
      <mdl.Checkbox
        checked={!!value || false}
        label={label}
        disabled={disabled}
        onBlur={(event) => onBlur(event.target.checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }
}
