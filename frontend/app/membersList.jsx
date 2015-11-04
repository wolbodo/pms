import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import memberForm from './form';

import members from './members';

import _ from 'lodash';

export default class MembersList extends React.Component {
	render() {
		var columns = [
			{name: "nickname", label: "Bijnaam"},
			{name: "firstname", label: "Naam"},
			{name: "lastname", label: "Achternaam"},
			{name: "city", label:"Plaats"},
			{name: "mobile", label:"Mobiel"},
			{name: "email", label:"Email"}

		];


		return (
		<mdl.Grid className='main-content'>
			<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
				<mdl.DataTable columns={columns} data={members}/>
			</mdl.Cell>
		</mdl.Grid>
		);
	}
}