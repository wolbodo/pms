import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Boolean extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.bool,
    permissions: PropTypes.object,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Boolean'
  };

  render() {
    const { title, value, permissions,
        onChange, onBlur } = this.props;

    return (
      <mdl.Checkbox
        checked={!!value || false}
        label={title}
        disabled={!permissions.edit}
        onBlur={(event) => onBlur(event.target.checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }
}
