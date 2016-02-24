import React from 'react'
import ReactDOM  from 'react-dom'
import _ from 'lodash'
import * as mdl from 'react-mdl'

import {Chip} from 'components'

export default class Array extends React.Component {
	onChange(index) {
		let {onBlur, value} = this.props;
		onBlur(
			_.filter(value, (x, i) => i !== index)
		)
	}

	addValue(e) {
		let new_value = _.trim(e.target.textContent)
		let {onBlur, value} = this.props
		value = value || []

		e.target.textContent = undefined

		if (!_.isEmpty(new_value)) {
			onBlur(
				_(value).concat(new_value).value()
			)
		}
	}
	deleteValue() {
		let {onBlur, value} = this.props

		onBlur(_.slice(value, 0, -1))
		
	}

	render() {
		let { name, label, value, disabled,
			  onChange, onBlur } = this.props

		// Shows an array of strings for now.
		value = value || [];
		return (
			<div className='chip-list' onClick={e => {
				// focus the p element when clicking on the chip-list
				ReactDOM
					.findDOMNode(this)
					.querySelector('#chiplist-' + name)
					.focus()
			}}>
				<div>
				{ _.map(value, (item, i) => (
					<Chip key={i}>
						{item}
						<i className="material-icons" 
							onClick={() => this.onChange(i)}
						>cancel</i>
					</Chip>
				))}
				<p id={'chiplist-' + name} 
					contentEditable="true"
					onBlur={(e) => this.addValue(e)}
					onKeyPress={e => (e.key === "Enter") && this.addValue(e)}
					onKeyDown={e => (e.key === "Backspace" && _.isEmpty(e.target.textContent)) && this.deleteValue()}
				/>
				</div>
				<label className="chip-list--label" htmlFor={'chiplist-' + name}>{label}</label>
			</div>
		);
	}
}
