import React, { PropTypes } from 'react';

import * as mdl from 'react-mdl';
// import { DatePicker } from 'material-ui';

export default class Date extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Date'
  };

  // TODO: OnChange, and properly showing dates
  render() {
    const { value, title, disabled, onChange, onBlur } = this.props;

    // return (
    //   <DatePicker
    //     className="datepicker"
    //     container="dialog"
    //     autoOk
    //     disabled={disabled}
    //     floatingLabelText={title}
    //     open={!disabled}
    //     style={{
    //       width: '125px'
    //     }}
    //     textFieldStyle={{
    //       width: '125px'
    //     }}
    //   />
    // );

    return (
      <div className="textfield">
        <div className="auto-size">{value || title}</div>
        <mdl.Textfield
          className={[`field-${name}`, (value !== undefined) ? 'is-dirty' : ''].join(' ')}
          label={title}
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
