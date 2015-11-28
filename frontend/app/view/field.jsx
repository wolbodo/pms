import React from 'react';
import ReactDOM from 'react-dom';

import DatePicker from 'material-ui/lib/date-picker/date-picker';
import SelectField from 'material-ui/lib/select-field';

import mdl from 'react-mdl';

import _ from 'lodash';

export default class Field extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.state = {
			value : this.props.value
		};
	}
	handleChange(value) {
		if (this.props.field.type === 'array') {
            const DropDownMenu = require('material-ui/lib/drop-down-menu');
			value = _.map(value.split(','), _.trim);
		}
		this.setState({
			value: value
		});

        this.props.onChange(value, this.props.field.name);
    }
    _handleEnumValueChange(ev ,i, option) {
        let value = option.payload;
        this.setState({
            value: value
        });
		this.props.onChange(value, this.props.field.name);
    }

    componentDidUpdate() {
        componentHandler.upgradeDom();
    }

	componentWillReceiveProps(props){ 
		if (props.value !== this.props.value) {
			this.setState({
				value: props.value
			});
		}
	}
	render () {
		var {field, disabled} = this.props;

		var {value} = this.state;
		switch(field.type) {
			case "string": 
				return (
					<mdl.Textfield
						className={['field-' + field.name, (this.state.value !== undefined) ? 'is-dirty' : ''].join(' ')}
						label={field.label}
						name={field.name}
						value={value}
						disabled={disabled}
						onChange={this.handleChange}
						floatingLabel/>
				);
			case "option":
				return (
					<mdl.RadioGroup
						name={field.name}
						value={value || ''}
						onChange={this.handleChange}>
						{
							_.map(field.options, 
								(value, name) => (
									<mdl.Radio
										key={name}
										disabled={disabled}
										name={field.name}
										value={name}
										ripple>
										{value}
									</mdl.Radio>
								)	
							)
						}
					</mdl.RadioGroup>
				);
            case "enum": 
                return (
                    <SelectField
                        className="selectfield"
                        floatingLabelText={field.label} 
                        hintText={field.label}
                        value={value}
                        onChange={this._handleEnumValueChange.bind(this)}
                        disabled={disabled}
                        menuItems={ _.map(field.options, (field, key) => ({
                                    'payload': key, 
                                    'text': field
                                })) } />
                );
			case "boolean": 
				return (
					<mdl.Checkbox
						checked={value || false}
						label={field.label}
						disabled={disabled}
						onChange={this.handleChange}>
					</mdl.Checkbox>
				)
			case "array":
				// Shows an array of strings for now.
				value = value || [];
				return (
					<mdl.Textfield
						className={['field-' + field.name, (this.state.value !== undefined) ? 'is-dirty' : ''].join(' ')}
						label={field.label}
						name={field.name}
						value={value.join(', ')}
						disabled={disabled}
						onChange={this.handleChange}
						floatingLabel/>
				);
			case "date": 
				return (
					<DatePicker 
                        className = "datepicker"
					    container="dialog"
                        autoOk={true}
                        disabled={disabled}
                        floatingLabelText={field.label} 
                        open={true} 
                        style={{
                            width: '125px'
                        }} 
                        textFieldStyle={{
                            width: '125px'
                        }} />
				);
			default:
				console.warn("Unknown type on formfield: " + field.type);
				return (
					<p>--</p>);

		}
	}
}