import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import memberForm from './form';

import _ from 'lodash';

export default class MembersList extends React.Component {
	render() {
		var columns = [
			{name: "firstname", label: "Naam"},
			{name: "lastname", label: "Achternaam"},
			{name: "city", label:"Plaats"},
			{name: "mobile", label:"Mobiel"},
			{name: "email", label:"Email"}
		];


		return (
			<mdl.DataTable columns={columns} data={this.props.members}/>
		);
	}
}