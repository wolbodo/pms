import React from 'react';
import mdl from 'react-mdl';

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
				"name": "firstname"
			}, {
				"type": "string",
				"label": "Tussenvoegsel",
				"name": "infix"
			}, {
				"type": "string",
				"label": "Achternaam",
				"name": "lastname"
			}]
    }



	render() {

		var {roles, fields} = this.props;
		
		return (<mdl.Grid className='main-content'>
					<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
						<table className='mdl-data-table mdl-js-data-table'>
							<thead>
								<tr>
									{roles.map((role) => {
										return <th key={role}>{role}</th>;
									})}
								</tr>
							</thead>
							<tbody>
								{fields.map((field, i) => {
									return (
										<tr key={field.key ? field.key : i}>
											<th>{field.label}</th>
											{roles.map((role) => (
												<td key={role}>
													{ role }
												</td>
											))}
										</tr>
									);
								})}
							</tbody>
						</table>
						
					</mdl.Cell>
				</mdl.Grid>)
		
	}




}