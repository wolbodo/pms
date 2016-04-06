import React, { PropTypes } from 'react';

import { DatePicker } from 'material-ui';

export default class Date extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Date'
  };

  // TODO: OnChange, and properly showing dates
  render() {
    let { title, disabled } = this.props;

    return (
      <DatePicker
        className="datepicker"
        container="dialog"
        autoOk
        disabled={disabled}
        floatingLabelText={title}
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
