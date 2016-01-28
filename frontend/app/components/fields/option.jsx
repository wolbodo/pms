import React from 'react';
import * as mdl from 'react-mdl'


export default class Option extends React.Component {
	render() {
		let { name, label, value, disabled, options,
			  onChange, onBlur } = this.props

		return (
			<mdl.RadioGroup
				name={name}
				value={value || ''}
				onBlur={(e) => onBlur(e.target.value)}
				onChange={e => onChange(e.target.value)}>

				{
					_.map(options, 
						(value, name) => (
							<mdl.Radio
								key={name}
								disabled={disabled}
								name={name}
								value={name}
								ripple>
								{value}
							</mdl.Radio>
						)	
					)
				}
			</mdl.RadioGroup>
		);
	}
}