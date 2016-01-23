import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import actions from 'actions'
import ItemEdit from 'components/view/itemEdit'


class FieldsEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {params, fields, dispatch } = this.props;

		return (
			<ItemEdit
				schema={fields.schemas.field}
				item={fields.schemas.member.fields[params.veld]}
				onChange={field => {
					dispatch(actions.fields.updateField('member', params.veld, field))
				}} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  const { fields } = state

	  return {
	    fields
	  }
	})
	(FieldsEdit);