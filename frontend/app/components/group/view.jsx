
import React from 'react';

import {List, Head, Row} from 'components/view/list';
import {Link} from 'react-router';

import { connect } from 'react-redux';

export default class GroupView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var fields = ['name', 'description'];

		const {history, groups} = this.props;
			
		return (
			<List title="Groepen">
				<Head schema={groups.schema} fields={fields} editLink/>
				{_.map(groups.items, row => (
					<Row className='click' key={row.name} item={row} fields={fields} 
						edit={ () => history.push(`groepen/${row.id}`) } />
				))}
			</List>
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
	(GroupView);