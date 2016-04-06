import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Boolean extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Boolean'
  };

  render() {
    const { title, value, disabled,
        onChange, onBlur } = this.props;

    return (
      <mdl.Checkbox
        checked={!!value || false}
        label={title}
        disabled={disabled}
        onBlur={(event) => onBlur(event.target.checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }
}
