
import React from 'react';

import {List, Head, Row} from '../view/list';
import schema from './schema.json';
import API from '../api';
import { Link } from 'react-router';

import { Navigation } from 'react-router'

class MemberView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			members: []
		};

		API.get_members()
			.then(members => this.setState({members: members}));
	}

	render() {
		var fields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
						'mobile', 'email'];

		const {history} = this.props;
		const {members} = this.state;

		return (
			<List title="Leden">
				<Head schema={schema} fields={fields} editLink/>
				{members.map((row, i) => (
					<Row 
						className="click"
						key={i} 
						item={row} 
						fields={fields} 
						edit={() => history.push(`/lid-${row.id}`)} />
				))}
			</List>
		);
	}
};

export default MemberView;