
import React from 'react';

import {List, Head, Row} from '../view/list';
import schema from './schema';

import axios from 'axios';

export default class MemberView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			members: []
		};

		axios.get('/api/members')
		 .then(function (resp) {
			this.setState({
				members: resp.data
			});
		 }.bind(this));
	}

	render() {
		var fields = ['nickname', 'firstname', 'lastname', 'city',
						'mobile', 'email'];
		var {members} = this.state;


		return (
			<List>
				<Head schema={schema} fields={fields}/>
				{members.map((row, i) => (
					<Row key={i} item={row} fields={fields} editLink={`/edit/${row.id}`}/>
				))}
			</List>
		);
	}
}