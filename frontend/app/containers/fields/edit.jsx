import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import actions from 'actions'

import { ItemEdit } from 'components'


class FieldsEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {params, fields, permissions, dispatch } = this.props;

		return (
			<ItemEdit
				schema={fields.schemas.field}
                permissions={permissions.leden.field}
				item={fields.schemas.person.fields[params.veld]}
				onChange={field => {
					dispatch(actions.fields.updateField('person', params.veld, field))
				}} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  return {
	    fields: state.app.get('fields').toJS(),
	    permissions: state.app.get('permissions').toJS()
	  }
	})
	(FieldsEdit);