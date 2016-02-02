import React from 'react';
import * as mdl from 'react-mdl'

import Field from './field';
import update from  'react-addons-update';

import * as _ from 'lodash';

export default class ItemEdit extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(value, key) {
		let {onChange} = this.props;

		console.log("Setting store")

		if (onChange) {
			onChange({
				[key]: value
			})
		}
	}

	renderField(fieldname, key) {
		const {schema, permissions, item} = this.props

		let field = schema.fields[fieldname]
		let disabled = !_.includes(permissions.write, fieldname)


		return (
			<Field 
				key={key} 
				field={field}
				tabIndex="0"
				disabled={disabled}
				onChange={this.handleChange}
				value={item[field.name]} />
		)
	}
	renderFieldSet(fields, key) {
		return (
			<div key={key} className="mdl-card__formset">
			{
				// Turn fields into array if not already.
				(_.isArray(fields) 
					? fields
					: [fields]
				).map(this.renderField.bind(this))
			}
			</div>
		)
	}
	render() {
		const {schema, item } = this.props;

		return (
		<form className='content' onSubmit={this.handleSubmit}>
			{_.map(schema.form, (fieldset, i) => (
				<mdl.Card key={i} className='mdl-color--white mdl-shadow--2dp'>
					<mdl.CardTitle>
						{fieldset.title}
					</mdl.CardTitle>
					<div className="mdl-card__form">
						{ _.map(fieldset.fields, this.renderFieldSet.bind(this)) }
					</div>
				</mdl.Card>

			))}
		</form>

		)
	}
} 