
import React from 'react'
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/view/list'
import {Link} from 'react-router'

import { connect } from 'react-redux'

import actions from 'actions'

export default class GroupView extends React.Component {
	constructor(props) {
		super(props);
	}

	renderButtons() {
		let {dispatch} = this.props;

		return (
			<mdl.IconButton 
				name="add"
				onClick={() => dispatch(actions.groups.create())} />
		)
	}

	render() {
		var header_fields = ['name', 'description'];

		const {history, groups, fields} = this.props;
			
		return (
			<List title="Groepen" buttons={this.renderButtons()}>
				<Head schema={fields.schemas.group} fields={header_fields} editLink/>
				{_.map(groups.items, row => (
					<Row className='click' key={row.name} item={row} fields={header_fields} 
						edit={ () => history.push(`groepen/${row.id}`) } />
				))}
			</List>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
	  const { groups, fields } = state

	  return {
	    groups, fields
	  }
	})
	(GroupView);