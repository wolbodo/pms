
import React from 'react';

import {List, Head, Row} from '../view/list'
import schema from './schema'
import stub from './stub'


export default class GroupView extends React.Component {

	render() {
		var fields = ['name', 'description'],
			data = stub;
			
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
