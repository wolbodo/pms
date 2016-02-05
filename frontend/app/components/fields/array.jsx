import React from 'react';
import _ from 'lodash'
import * as mdl from 'react-mdl'

import {Chip} from 'components'

export default class Array extends React.Component {

	render() {
		let { name, label, value, disabled,
			  onChange, onBlur } = this.props

		// Shows an array of strings for now.
		value = value || [];
			// <mdl.Textfield
			// 	className={['field-' + name, (value !== undefined) ? 'is-dirty' : ''].join(' ')}
			// 	label={label}
			// 	name={name}
			// 	value={value.join(', ')}
			// 	disabled={disabled}
			// 	onChange={(e) => onChange(_.map(e.target.value.split(','), _.trim))}
			// 	onBlur={(e) => onBlur(_.map(e.target.value.split(','), _.trim))}
			// 	floatingLabel/>
		return (
			<div className='chip-list'>
				{ _.map(value, (value, i) => (
					<Chip>{value}</Chip>
				))}
				<label class="chip-list--label">{label}</label>
			</div>
		);
	}
}