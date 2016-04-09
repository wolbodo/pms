import _ from 'lodash';
import React, { PropTypes } from 'react';
import fields from './fields';

export default class Field extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array,
      React.PropTypes.bool,
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    field: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      value: this.props.value
    };
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange(event) {
    // triggers on onBlur of element,
    const value = event.target.value;
    this.setState({
      value
    });

    this.props.onChange(value, this.props.field.name);
  }

  render() {
    const { field, disabled, onChange } = this.props;
    const { value } = this.state;

    // select field edit component.
    let Comp = {
      string: fields.Text,
      option: fields.Option,
      enum: fields.Enum,
      boolean: fields.Boolean,
      array: fields.Array,
      date: fields.Date,
      link: fields.Link,
    }[_.get(field, 'type', 'string')];
    // Default to string

    return (
      <Comp
        {...field}
        disabled={disabled}
        value={value}
        onChange={(_value) => this.setState({ value: _value }) }
        onBlur={(_value) => onChange(_value, field.name)}
      />
    );
  }
}
