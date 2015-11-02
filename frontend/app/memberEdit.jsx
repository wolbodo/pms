import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import memberForm from './form';
import FormField from './formField';

import _ from 'lodash';

export default class MemberEdit extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.state = {
			forms: [
				memberForm.person,
				memberForm.adress,
				memberForm.contact,
				memberForm.details
			],
			model: this.props.member
		};
	}
	handleChange(value, key) {
		var model = this.state.model;
		model[key] = value;

		this.setState({
			model: model
		});
	}
	render() {
		var data = this.props.member || {};

		return (
			<form onSubmit={this.handleSubmit}>
				{this.state.forms.map((form, key) => (
				<mdl.Card key={key}>
					<mdl.CardTitle>
						{form.title}
					</mdl.CardTitle>
					<div className="mdl-card__form">
						{form.fields.map((fields, key) => (
							<div key={key} className="mdl-card__formset">
								{(_.isArray(fields) 
									? fields
									: [fields]
								).map(
									(field, key) => (
										<FormField 
											key={key} 
											field={field}
											onChange={this.handleChange}
											value={data[field.name]} />
									)
								)}
							</div>
						))}
					</div>
					<mdl.CardActions>
						<mdl.Button colored>Opslaan</mdl.Button>
					</mdl.CardActions>
				</mdl.Card>
				))}
			</form>

		)
	}
}