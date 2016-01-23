import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import {Popover} from 'material-ui';

import _ from 'lodash';

import groups from '../group/stub.json';
import schema from '../member/schema.json';


import { Link } from 'react-router';



var permissions = {
	leden: {
		read: ["nickname", 
				"firstname", 
				"infix", 
				"lastname", 
				"gender", 
				"birthdate", 
				"deathdate", 
				"street", 
				"iban", 
				"directdebit", 
				"email", 
				"mobile", 
				"membertype", 
				"membertill", 
				"functions", 
				"notes", 
				"keycode", 
				"cashregister", 
				"passwordhash", 
				"modified"
		],
		"write": ["nickname", 
				"firstname", 
				"infix", 
			"lastname", 
				"gender", 
				"birthdate", 
				"deathdate", 
				"street", 
				"directdebit", 
				"email", 
				"mobile", 
				"functions", 
				"notes", 
		]
	},
	bestuur: {
		read: [
			"frontdoor"
		],
		write: [
			"zipcode",
			"city",
			"country",
			"iban",
			"directdebit",
			"email",
			"mobile",
			"phone",
			"emergencyinfo",
			"membertype",
			"membersince",
			"membertill",
			"functions",
			"notes",
			"wantscontact",
		]
	},
	oudleden: {
		read: [
			"frontdoor"
		]
	}
};


var zelf =   {
    "id": "zelf",
    "name": "Zelf",
    "description": "jezelf"
  };


export default class PermissionsView extends React.Component {

	constructor(props) {
		super(props);

		this.renderPopover = this.renderPopover.bind(this);

		this.state = {
		};
	}

	show(state, e) {
	  this.setState({
	    popupState:state,
	    anchorEl:e.currentTarget
	  });
	}

	closePopover() {
		this.setState({
	    	popupState:undefined
	  	});
	}

	clickTable(e) {
		if (!_.contains(e.target.className, 'mdl-button')) {
			this.closePopover();
		}
	}

	renderPopover() {
		const {popupState} = this.state;

		if (popupState) {
			return (<mdl.Card>
				<mdl.CardTitle>
					{ `Wijzigen permissies voor '${ popupState.group.name }' op veld '${popupState.field.label}'` }
				</mdl.CardTitle>
			</mdl.Card>);
		} else {
			return (<div></div>);
		}

	}

	getPermissions(group, field) {
		var read = _.contains(permissions[group.id].read, field.name),
			write = _.contains(permissions[group.id].write, field.name);

		return {read: read, write: write};
	}

	render () {
		return (


			<mdl.Card className='content permissions mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>
					Permissies
				</mdl.CardTitle>
				<mdl.CardText>
					<table className='mdl-data-table mdl-js-data-table'>
						<thead>
							<tr>
								<th></th>
								{groups.map(group => (
									<th key={group.id} className='mdl-data-table__cell--non-numeric'>
										<Link to={`/groepen/${group.id}`}>
											{group.name}
										</Link>
									</th>
								))}
								<th></th>
								<th>Zelf</th>
							</tr>
						</thead>
						<tbody>
							{_.map(schema.fields, (field, i) => 
								(<tr key={i}>
									<th>
										<Link to={`/velden/${field.name}`}>
											{field.label}
										</Link>
									</th>
									{_.map(groups, (group, i) => 
										(<td key={i}>
											<span className='permission' onClick={this.show.bind(this, {group:group, field:field})}>
											{ (({read, write}) => 
												[read ? <i className='icon'>visibility</i>
													  : <i className='icon dimmed'>visibility_off</i>,
												  write ? <i className='icon'>edit</i> 
												   		: <i className='icon dimmed'>edit</i>
												]
											  )(this.getPermissions(group, field))
										    }
										    </span>
										</td>)
									)}
									<td></td>
									<td>
									</td>
								</tr>)
							)}
						</tbody>
					</table>
					<Popover open={!!this.state.popupState}
					  anchorEl={this.state.anchorEl}
					  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
					  onRequestClose={this.closePopover.bind(this)} >
					  { this.renderPopover() }
					</Popover>
				</mdl.CardText>
			</mdl.Card>
		)
	}
}