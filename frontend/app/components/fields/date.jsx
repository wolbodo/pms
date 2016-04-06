import React, { PropTypes } from 'react';

import { DatePicker } from 'material-ui';

export default class Date extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    label: 'Date'
  };

  // TODO: OnChange, and properly showing dates
  render() {
    let { label, disabled } = this.props;

    return (
      <DatePicker
        className="datepicker"
        container="dialog"
        autoOk
        disabled={disabled}
        floatingLabelText={label}
        open={!disabled}
        style={{
          width: '125px'
        }}
        textFieldStyle={{
          width: '125px'
        }}
      />
    );
  }
}
