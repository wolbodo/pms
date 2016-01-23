import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import { connect } from 'react-redux';

import {requestMembers, fetchMembers} from 'actions'



export default class MemberEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const {params, members, fields} = this.props;

		// var data = _.find(stub, group => group.id === params.groep);

		return (
			<ItemEdit
				schema={fields.schemas.member}
				item={members.items[params.id]}/>
		);
	}
}



export default connect(
	function mapStateToProps(state) {
	  const { members, fields } = state
	  const isFetching = false

	  return {
	    members, fields, 
	    isFetching
	  }
	})
	(MemberEdit);

