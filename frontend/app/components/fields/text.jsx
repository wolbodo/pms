import React from 'react';
import * as mdl from 'react-mdl'


export default class Text extends React.Component {
	render() {
		let { name, label, value, disabled,
			  onChange, onBlur } = this.props

		return (
			<div className='textfield'>
			<div className='auto-size'>{value || label}</div>
			<mdl.Textfield
				className={['field-' + name, (value !== undefined) ? 'is-dirty' : ''].join(' ')}
				label={label}
				name={name}
				value={value}
				disabled={disabled}
				onBlur={(e) => onBlur(e.target.value)}
				onChange={e => onChange(e.target.value)}
				floatingLabel/>
			</div>
		);
	}
}