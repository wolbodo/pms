import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import memberForm from './form';

import _ from 'lodash';
import axios from 'axios';

export default class MembersList extends React.Component {

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


    _getCellClass(column) {
        return !column.numeric ? 'mdl-data-table__cell--non-numeric' : '';
    }


	render() {
		var columns = [
			{name: "edit", icon: "mode edit"},
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
				<table className='mdl-data-table mdl-js-data-table'>
					<thead>
						<tr>
							{columns.map((column) => {
								return <th key={column.name} className={this._getCellClass(column)}>{column.label}</th>;
							})}
						</tr>
					</thead>
					<tbody>
						{this.state.members.map((e, i) => {
							return (
								<tr key={e.key ? e.key : i}>
									{columns.map((column) => (
										<td key={column.name} className={this._getCellClass(column)}>
											{ column.icon ? 
												(<i className='material-icons'>{column.icon}</i>) :
												e[column.name]
											}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
				
			</mdl.Cell>
		</mdl.Grid>
		);
	}
}