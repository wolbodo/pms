
import React from 'react'
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/list'
import {Link} from 'react-router'

import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import * as groupActions from 'redux/modules/groups';

@connect(state => ({
	groups: state.get('groups').toJS(),
	fields: state.get('fields').toJS()
}), {
	create: groupActions.create,
	push: push
})
export default class GroupView extends React.Component {
	constructor(props) {
		super(props);
	}

	renderButtons() {
		let {create} = this.props;

		return (
			<mdl.IconButton 
				name="add"
				onClick={() => create.create()} />
		)
	}

	render() {
		var header_fields = ['name', 'description'];

		const {groups, fields, push} = this.props;
			
		return (
			<List title="Groepen" buttons={this.renderButtons()}>
				<Head schema={fields.schemas.group} fields={header_fields} editLink/>
				{_.map(groups.items, (row, i) => (
					<Row className='click' key={i} item={row} fields={header_fields} 
						edit={ () => push(`groepen/${i}`) } />
				))}
			</List>
		);
	}
}
