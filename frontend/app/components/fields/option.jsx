import _ from 'lodash';
import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Option extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    value: PropTypes.array,
    options: PropTypes.object.isRequired,
    permissions: PropTypes.object,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Option'
  };

  render() {
    const { name, value, permissions, options,
        onChange, onBlur } = this.props;

    return (
      <mdl.RadioGroup
        name={name}
        value={value || ''}
        onBlur={(event) => onBlur(event.target.value)}
        onChange={(event) => onChange(event.target.value)}
      >

        {
          _.map(options,
            (optValue, optName) => (
              <mdl.Radio
                key={optName}
                disabled={!permissions.edit}
                name={optName}
                value={optName}
                ripple
              >
                {optValue}
              </mdl.Radio>
            )
          )
        }
      </mdl.RadioGroup>
    );
  }
}
