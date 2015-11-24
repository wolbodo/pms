import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import FormField from '../formField';

import _ from 'lodash';

export default class ItemEdit extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.state = {
			model: this.props.item
		};
	}
	handleChange(value, key) {
		var {model} = this.state;
		model[key] = value;

		this.setState({
			model: model
		});
	}
	render() {
		const {schema, item} = this.props;

		var data = this.state.model;

		return (
		<form className='content' onSubmit={this.handleSubmit}>
			<mdl.Card className='mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>
					{schema.title}
				</mdl.CardTitle>
				<div className="mdl-card__form">
					{_.map(schema.fields, (fields, key) => (
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
			</mdl.Card>
		</form>

		)
	}
}