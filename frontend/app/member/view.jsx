
import React from 'react';

import {List, Head, Row} from '../view/list';
import schema from './schema.json';
import API from '../api';


export default class MemberView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			members: []
		};

		API.get_members()
			.then(members => this.setState({members: members}));

	}

	render() {
		var fields = ['nickname', 'firstname', 'lastname', 'city',
						'mobile', 'email'];
		var {members} = this.state;


		return (
			<List>
				<Head schema={schema} fields={fields}/>
				{members.map((row, i) => (
					<Row key={i} item={row} fields={fields} editLink={row.id && `/lid-${row.id}` }/>
				))}
			</List>
		);
	}
}
