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
		const {groups, fields, params, permissions, dispatch} = this.props

                // extra={}
		return (
			<ItemEdit
				schema={fields.schemas.group}
				item={groups.items[params.groep]}
                permissions={permissions.leden.group}
				onChange={(value, key) => {
					dispatch(actions.groups.update(params.groep, {[key]: value}))
				}} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  return {
	    groups: state.get('groups').toJS(), 
	    fields: state.get('fields').toJS(),
	    permissions: state.get('permissions').toJS()
	  }
	})
	(GroupEdit);