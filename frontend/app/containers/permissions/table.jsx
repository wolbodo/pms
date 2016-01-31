import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'
import { connect } from 'react-redux';

import {Popover} from 'material-ui';

import _ from 'lodash';

import { Link } from 'react-router';

class PermissionsView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
	}

	showPopover(state, e) {
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
			() => this.closePopove
		}
	}

	getPermissions(group, field) {
		const {permissions} = this.props
		var read = _.contains(permissions[group.id].read, field.name),
			write = _.contains(permissions[group.id].write, field.name);

		return {read: read, write: write};
	}

	renderPopover() {
		const {popupState} = this.state
		return (!!popupState && (
			<mdl.Card>
				<mdl.CardTitle>
					{ `Wijzigen permissies voor '${ popupState.group.name }' op veld '${popupState.field.label}'` }
				</mdl.CardTitle>
			</mdl.Card>
		)) || (<div />)
	}
	renderHeading() {
		const {groups} = this.props

		return (
		<thead>
			<tr>
				<th></th>
				{_.map(groups.items, group => (
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
		)
	}
	renderBody() {
		const {fields, groups} = this.props
		return (
			<tbody>
				{_.map(fields.schemas.member.fields, (field, i) => 
					(<tr key={i}>
						<th>
							<Link to={`/velden/${field.name}`}>
								{field.label}
							</Link>
						</th>
						{_.map(groups.items, (group, i) => 
							(<td key={i}>
								<span className='permission' onClick={(e) => this.showPopover({group:group, field:field}, e)}>
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
		)
	}

	render () {
		return (
			<mdl.Card className='content permissions mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>
					Permissies
				</mdl.CardTitle>
				<mdl.CardText>
					<table className='mdl-data-table mdl-js-data-table'>
						{ this.renderHeading() }
						{ this.renderBody() }
					</table>
					<Popover open={!!this.state.popupState}
					  anchorEl={this.state.anchorEl}
					  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
					  onRequestClose={() => this.closePopover()} >
					  { this.renderPopover() }
					</Popover>
				</mdl.CardText>
			</mdl.Card>
		)
	}
}


function mapStateToProps(state) {
  const { members, groups, fields, permissions } = state.app.toJS()

  return {
    members, groups, fields, permissions
  }
}

export default connect(mapStateToProps)(PermissionsView);

