import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import _ from 'lodash';

import schema from '../member/schema.json';

export default class Fields extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var fields = _.values(schema.fields);
		var data = _.keys(schema.fields);
		return (

			<List>
				<Head schema={schema} fields={fields}/>
				{data.map(row => (
					<Row key={row.name} item={row} fields={fields} editLink={`/groepen/${row.id}`}/>
				))}
			</List>

		);
	}	
}