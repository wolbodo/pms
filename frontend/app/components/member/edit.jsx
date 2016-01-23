import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import schema from './schema.json';

import { connect } from 'react-redux';

import {requestMembers, fetchMembers} from 'actions'



export default class MemberEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			member: {}
		};
	}
	render() {
		const {params} = this.props;
		var {member} = this.state;

		// var data = _.find(stub, group => group.id === params.groep);

		return member ?(
			<ItemEdit
				schema={schema}
				item={member}/>
		) : (
			<p>-</p>
		);
	}
}



export default connect(
	function mapStateToProps(state) {
	  const { members } = state
	  const isFetching = false

	  return {
	    members,
	    isFetching
	  }
	})
	(MemberEdit);

