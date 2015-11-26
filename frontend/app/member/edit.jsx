import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import schema from './schema.json';
import API from '../api';

export default class MemberEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			member: {}
		};

		API.get_member(parseInt(props.params.id))
		 .then(function (member) {
			this.setState({
				member: member
			});
		 }.bind(this));
	}
	render() {

		const {params} = this.props;

		var {member} = this.state;


		// var data = _.find(stub, group => group.id === params.groep);

		return member ?(
			<ItemEdit
				schema={schema}
				item={member}/>
		) : (
			<p>-</p>
		);
	}
}