import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import { connect } from 'react-redux';

import ItemEdit from 'components/view/itemEdit';


class FieldsEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {params, fields } = this.props;

		return (
			<ItemEdit
				schema={fields.schema}
				item={fields.schemas.member.fields[params.veld]}/>
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