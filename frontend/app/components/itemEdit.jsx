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
	render() {
		const {schema, item, permissions } = this.props;

		// Filter all readable nonempty fields, or writable fields
		// _.(readable && filled) || writable
		let map_filter = (arr, mapfun, filterfun) => _.filter(_.map(arr, mapfun), filterfun)

		let form = map_filter(
			schema.form, 
			group => ({
				title: group.title,
				fields: map_filter(
					group.fields,
					fieldset => map_filter(
						fieldset,
						field => (
							// Readable and nonempty					// writable
							(_.contains(permissions.read, field) && item[field]) || _.contains(permissions.write, field)
						) && {
						 	// Then add the field, with all info zipped into an object.
							schema: schema.fields[field],
							value: item[field],
							readable: _.contains(permissions.read, field),
							writable: _.contains(permissions.write, field)
						},
						field => !!field
					),
					fieldset => !_.isEmpty(fieldset)
				)
			}),
			group => !_.isEmpty(group.fields)
		)


		return (
		<form className='content' onSubmit={this.handleSubmit}>
		{_.map(form, (group, i) => (
			<mdl.Card key={i} className='mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>
					{group.title}
				</mdl.CardTitle>
				<div className="mdl-card__form">
				{_.map(group.fields, (fieldset, key) => (
					<div key={key} className="mdl-card__formset">
					{_.map(fieldset, (field, key) => (
						<Field 
							key={key} 
							field={field.schema}
							tabIndex="0"
							disabled={!field.writable}
							onChange={this.handleChange}
							value={field.value} />
					))}
					</div>
				))}
				</div>
			</mdl.Card>
		))}
		</form>

		)
	}
} 