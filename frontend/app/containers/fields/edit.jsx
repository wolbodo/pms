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

		const {params, fields, dispatch } = this.props;

		return (
			<ItemEdit
				schema={fields.schemas.field}
                permissions={{read:[], write:[]}}
				item={fields.schemas.member.fields[params.veld]}
				onChange={field => {
					dispatch(actions.fields.updateField('member', params.veld, field))
				}} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  return {
	    fields: state.app.get('fields').toJS()
	  }
	})
	(FieldsEdit);