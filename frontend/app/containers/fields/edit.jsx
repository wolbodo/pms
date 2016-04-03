import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import actions from 'actions'

import { ItemEdit } from 'components'


@connect(state => ({
	fields: state.get('fields').toJS(),
	permissions: state.get('permissions').toJS()
}),{
	...actions.fields
})
export default class FieldsEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {params, fields, permissions, updateField } = this.props;

		return (
			<ItemEdit
				schema={fields.schemas.field}
                permissions={permissions.leden.field}
				item={fields.schemas.person.fields[params.veld]}
				onChange={(value, key) => updateField('person', params.veld, {[key]: value}) } />
		);
	}
}
