import _ from 'lodash';
import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Option extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.array,
    options: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    label: 'Option'
  };

  render() {
    const { name, value, disabled, options,
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
                disabled={disabled}
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
