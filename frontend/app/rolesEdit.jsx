import React from 'react';
import {Link} from 'react-router';

import mdl from 'react-mdl';
import _ from 'lodash';

export default class RolesEdit extends React.Component {

	constructor(props) {
		super(props);


		// this.state = {
		// 	data: {
		// 		firstname: ''
		// 	}
		// };
	}

    static defaultProps = {
        roles: ['admin', 'board', 'member', 'self'],
        fields: [
			{
				"type": "string",
				"label": "Voornaam",
				"name": "firstname",
				"permissions": {
					"board": ['R', 'W'],
					"member": ['R'],
					"self": ['R']
				}
			}, {
				"type": "string",
				"label": "Tussenvoegsel",
				"name": "infix",
				"permissions": {
					"board": ['R', 'W'],
					"member": ['R'],
					"self": ['R']
				}
			}, {
				"type": "string",
				"label": "Achternaam",
				"name": "lastname",
				"permissions": {
					"board": ['R', 'W'],
					"member": ['R'],
					"self": ['R']
				}
			}]
    }

    renderRow(field, i) {
    	var {roles} = this.props;

		return (
			<tr key={field.key ? field.key : i}>
				<th className="mdl-data-table__cell--non-numeric">
					<Link to={"/rollen/veld/" + field.name}>
						{field.label} 
						<i className="icon">edit</i>
					</Link>
				</th>
				{roles.map((role) => (
					<td key={role} className={role + " mdl-data-table__cell--non-numeric"}>
						{ field.permissions[role] ? field.permissions[role].join(', ') : "Geen" }
					</td>
				))}
			</tr>
		);
    }
	renderHeading() {
		var {roles} = this.props;

		return (
			<tr>
				<th></th>
				{roles.map((role) => (
					<th key={role} className="mdl-data-table__cell--non-numeric">
						<Link to={"/rollen/rol/" + role}>
							{ _.startCase(role) }
							<i className="icon">edit</i>
						</Link>
					</th>
				))}
				<th className="mdl-data-table__cell--non-nZumeric">
					<mdl.Button>Nieuwe rol</mdl.Button>
				</th>
			</tr>
		);
	}

	render() {

		var {roles, fields, popup} = this.props;
		
		return (<mdl.Grid className='main-content'>
					<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
						<table className='mdl-data-table mdl-js-data-table'>
							<thead>
								{ this.renderHeading() }
							</thead>
							<tbody>
								{ fields.map(this.renderRow, this) } 
								<tr>
									<th className="mdl-data-table__cell--non-numeric">
										<mdl.Button>Nieuw veld</mdl.Button>
									</th>
									<td>3 mensen</td>
									<td>120 mensen</td>
									<td>5 mensen</td>
									<td>Zichzelf</td>
									<td></td>
								</tr>
							</tbody>
						</table>
						
					</mdl.Cell>
					{popup}
				</mdl.Grid>)
		
	}




}