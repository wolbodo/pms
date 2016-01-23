import React from 'react';
import mdl from 'react-mdl';

import Field from './field';
import update from  'react-addons-update';

import _ from 'lodash';

export default class ItemEdit extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.state = {
			model: this.props.item || {}
		};
	}
	handleChange(value, key) {
		let {onChange} = this.props,
			{model} = this.state;

		model = update(model, {
			[key]: {
				$set: value
			}
		})

		this.setState({ model });

		console.log("Setting store")

		if (onChange) {
			onChange(model)
		}
	}
	componentWillReceiveProps(props) {
		if (props.item !== this.props.item) {
			console.log("Receiving props: ^ meaningless?");

			this.setState({
				model: props.item || {}
			});
		}
	}
	render() {
		const {schema, item} = this.props;

		// var model = item;

		var permissions = schema.permissions || {};

		let {model} = this.state;

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
												disabled={permissions.readonly && _.contains(
													permissions.readonly, 
													field.name
												) || field.readonly}
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