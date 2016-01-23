
import React from 'react';

import {List, Head, Row} from '../view/list';
import schema from './schema.json';
import stub from './stub.json';
import {Link} from 'react-router';

export default class GroupView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var fields = ['name', 'description'],
			data = stub;

		const {history} = this.props;
			
		return (
			<List title="Groepen">
				<Head schema={schema} fields={fields} editLink/>
				{data.map(row => (
					<Row className='click' key={row.name} item={row} fields={fields} 
						edit={ () => history.push(`groepen/${row.id}`) } />
				))}
			</List>
		);
	}
}
