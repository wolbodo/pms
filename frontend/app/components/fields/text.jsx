import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';


export default class Text extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    label: 'Date'
  };

  render() {
    const { name, label, value, disabled,
        onChange, onBlur } = this.props;

    return (
      <div className="textfield">
        <div className="auto-size">{value || label}</div>
        <mdl.Textfield
          className={[`field-${name}`, (value !== undefined) ? 'is-dirty' : ''].join(' ')}
          label={label}
          name={name}
          value={value}
          disabled={disabled}
          onBlur={(event) => onBlur(event.target.value)}
          onChange={(event) => onChange(event.target.value)}
          floatingLabel
        />
      </div>
    );
  }
}
