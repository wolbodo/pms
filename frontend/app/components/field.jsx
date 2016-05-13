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
    resource: PropTypes.object,
    permissions: PropTypes.object,
    onChange: PropTypes.func,
  };

  static FieldTypeMap = {
    string: fields.Text,
    option: fields.Option,
    enum: fields.Enum,
    boolean: fields.Boolean,
    array: fields.Array,
    date: fields.Date,
    reference: fields.List,
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
    const { field, permissions, resource, onChange } = this.props;
    const { value } = this.state;

    // select field edit component. Default to string
    let Comp = _.get(Field.FieldTypeMap, _.get(field, 'type', 'string'));

    return (
      <Comp
        {...field}
        permissions={permissions}
        value={value}
        resource={resource} // For links
        onChange={(_value) => {
          this.setState({ value: _value });
        }}
        onBlur={(_value) => onChange(_value, field.name)}
      />
    );
  }
}
