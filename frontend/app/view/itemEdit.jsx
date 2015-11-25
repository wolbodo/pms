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
			model: {}
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

		var {model} = this.state;



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
									<Field 
										key={key} 
										field={field}
										disabled={!_.contains(schema.permissions.readonly, field.name)}
										onChange={this.handleChange}
										value={model[field.name]} />
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