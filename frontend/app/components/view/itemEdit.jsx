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
		const {schema, item } = this.props;

		var model = item || {};

		var permissions = schema.permissions || {};
		var tabIndex = 0;
		return (
		<form className='content' onSubmit={this.handleSubmit}>
			{_.map(schema.form, (fieldset, i) => (
				<mdl.Card key={i} className='mdl-color--white mdl-shadow--2dp'>
					<mdl.CardTitle>
						{fieldset.title}
					</mdl.CardTitle>
					<div className="mdl-card__form">
						{_.map(fieldset.fields, (fields, key) => (
							<div key={key} className="mdl-card__formset">
								{(_.isArray(fields) 
									? fields
									: [fields]
								).map(
									(fieldname, key) => {
										let field = schema.fields[fieldname]

										return (
											<Field 
												key={key} 
												field={field}
												tabIndex={tabIndex}
												disabled={permissions.readonly
													&& (field.name in permissions.readonly)
													|| field.readonly}
												onChange={this.handleChange}
												value={model[field.name]} />
										)
									}
								)}
							</div>
						))}
					</div>
				</mdl.Card>

			))}
		</form>

		)
	}
}