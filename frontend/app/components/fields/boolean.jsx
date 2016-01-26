import React from 'react';
import * as mdl from 'react-mdl'


export default class Boolean extends React.Component {
	render() {
		let { name, label, value, disabled,
			  onChange, onBlur } = this.props

		return (
			<mdl.Checkbox
				checked={!!value || false}
				label={label}
				disabled={disabled}
				onBlur={(e) => onBlur(e.target.value)}
				onChange={e => onChange(e.target.value)}>

			</mdl.Checkbox>
		)
	}
}