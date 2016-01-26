
import React from 'react';
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/list';
import { Link } from 'react-router';
import { Navigation } from 'react-router'
import { connect } from 'react-redux';

import actions from 'actions'

class MemberView extends React.Component {

    static defaultProps = {
        members: []
    };
    
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		var { dispatch, auth } =  this.props;
		dispatch(actions.members.fetch(auth.token))
	}

	renderButtons() {
		let {dispatch} = this.props;

		return (
			<mdl.IconButton 
				name="add"
				onClick={() => dispatch(actions.members.create())} />
		)
	}

	render() {
		var headerfields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
						'mobile', 'email'];

		const {history, members, fields} = this.props;

		return (
			<List title="Leden" buttons={this.renderButtons()}>
				<Head schema={fields.getIn(['schemas', 'member'])} fields={headerfields} editLink/>
				{members.get('items').map((row, i) => (
					<Row 
						className="click"
						key={i} 
						item={row} 
						fields={headerfields} 
						edit={() => history.push(`/lid-${row.get('id')}`)} />
				))}
			</List>
		);
	}
};


function mapStateToProps(state) {
  const { members, auth } = state.app
  const fields = state.fields
  const isFetching = false

  return {
    members, auth, fields,
    isFetching
  }
}



export default connect(mapStateToProps)(MemberView);

