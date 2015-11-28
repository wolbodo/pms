import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import Field from './field';

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
		var {model} = this.state;
		model[key] = value;

		this.setState({
			model: model
		});
	}
	componentWillReceiveProps(props) {
		if (props.item !== this.props.item) {
			this.setState({
				model: props.item
			});
		}
	}
	render() {
		const {schema, item} = this.props;

		// var model = item;

		var permissions = schema.permissions || {};

		var {model} = this.state;



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
									(fieldname, key) => (
										<Field 
											key={key} 
											field={schema.fields[fieldname]}
											disabled={permissions.readonly && _.contains(
												permissions.readonly, 
												schema.fields[fieldname].name
											)}
											onChange={this.handleChange}
											value={model[schema.fields[fieldname].name]} />
									)
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