import React from 'react';


import * as mdl from 'react-mdl'

import fields from './fields'

export default class Field extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.state = {
			value : this.props.value
		};
	}
	handleChange(e) {
		// triggers on onBlur of element,
		let value = e.target.value
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
		var {field, disabled, onChange } = this.props;
		var {value} = this.state;

		// select field edit component.
		let Comp = {
			string: fields.Text,
			option: fields.Option,
			enum: fields.Enum,
			boolean: fields.Boolean,
			array: fields.Array,
			date: fields.Date
		}[field.type]

		return (
			<Comp 
				{...field}
				disabled={disabled}
				value={value}
				onChange={value => this.setState({value}) }
				onBlur={value => onChange(value, field.name)}>
			</Comp>
		)
	}
}