import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import schema from './schema.json';
import member_schema from '../member/schema.json';

export default class FieldsEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			field: member_schema.fields[this.props.params.veld] || {}
		};

	}
	render() {

		const {params} = this.props;

		var {field} = this.state;


		// var data = _.find(stub, group => group.id === params.groep);

		return field ?(
			<ItemEdit
				schema={schema}
				item={field}/>
		) : (
			<p>-</p>
		);
	}
}