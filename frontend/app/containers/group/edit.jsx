import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'

import { connect } from 'react-redux';

import {ItemEdit} from 'components';

import actions from 'actions'


class GroupEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const {groups, fields, params, dispatch} = this.props

		return (
			<ItemEdit
				schema={fields.schemas.group}
				item={groups.items[params.groep]}
                permissions={{read:[], write:[]}}
				onChange={group => {
					dispatch(actions.groups.update(params.groep, group))
				}} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  return {
	    groups: state.app.get('groups').toJS(), 
	    fields: state.app.get('fields').toJS()
	  }
	})
	(GroupEdit);