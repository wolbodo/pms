import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'

import { connect } from 'react-redux';

import {ItemEdit} from 'components';

import * as groupActions from 'redux/modules/groups';


@connect(state => ({
  groups: state.get('groups').toJS(), 
  fields: state.get('fields').toJS(),
  permissions: state.get('permissions').toJS()
}), {
	update: groupActions.update
})
export default class GroupEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const {groups, fields, params, permissions, update} = this.props

                // extra={}
		return (
			<ItemEdit
				schema={fields.schemas.group}
				item={groups.items[params.groep]}
                permissions={permissions.leden.group}
				onChange={(value, key) => {
					update(params.groep, {[key]: value})
				}} />
		);
	}
}
