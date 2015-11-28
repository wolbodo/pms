import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import _ from 'lodash';

import {List, Head, Row} from '../view/list';

import member_fields from '../member/schema.json';
import schema from './schema.json';

export default class Fields extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var fields = ['name', 'label', 'type'];
		var data = _.values(member_fields.fields);

		return (

			<List>
				<Head schema={schema} fields={fields}/>
				{data.map(row => (
					<Row key={row.name} item={row} fields={fields} editLink={`/velden/${row.name}`}/>
				))}
			</List>

		);
	}	
}