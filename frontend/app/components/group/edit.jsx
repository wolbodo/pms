import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import { connect } from 'react-redux';

import ItemEdit from 'components/view/itemEdit';


class GroupEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const {groups, params} = this.props

		return (
			<ItemEdit
				schema={groups.schema}
				item={groups.items[params.groep]} />
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  const { groups } = state

	  return {
	    groups
	  }
	})
	(GroupEdit);