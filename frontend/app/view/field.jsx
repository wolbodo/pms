import React from 'react';
import ReactDOM from 'react-dom';
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
		this.setState({
			value: value
		});

		this.props.onChange(value, this.props.field.name);
	}
	render () {
		var field = this.props.field;
		switch(field.type) {
			case "string": 
				return (
					<mdl.Textfield
						className={'field-' + field.name}
						label={field.label}
						name={field.name}
						value={this.state.value}
						onChange={this.handleChange}
						floatingLabel/>
				);
			case "option":
				return (
					<mdl.RadioGroup
						name={field.name}
						value={this.state.value || ''}
						onChange={this.handleChange}>
						{
							_.map(field.options, 
								(value, name) => (
									<mdl.Radio
										key={name}
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
			case "boolean": 
				return (
					<mdl.Checkbox
						checked={this.state.value || false}
						label={field.label}
						onChange={this.handleChange}>
					</mdl.Checkbox>
				)
			default:
				throw "Unknown type on formfield: " + field.type;

		}
	}
}