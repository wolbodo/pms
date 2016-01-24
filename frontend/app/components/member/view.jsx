
import React from 'react';
import mdl from 'react-mdl';

import {List, Head, Row} from '../view/list';
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
		return (
			<mdl.FABButton>
			    <mdl.Icon name="add" />
			</mdl.FABButton>
		)
	}

	render() {
		var headerfields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
						'mobile', 'email'];

		const {history, members, fields} = this.props;

		return (
			<List title="Leden" buttons={this.renderButtons()}>
				<Head schema={fields.schemas.member} fields={headerfields} editLink/>
				{_.values(members.items).map((row, i) => (
					<Row 
						className="click"
						key={i} 
						item={row} 
						fields={headerfields} 
						edit={() => history.push(`/lid-${row.id}`)} />
				))}
			</List>
		);
	}
};


function mapStateToProps(state) {
  const { members, auth } = state
  const fields = state.fields
  const isFetching = false

  return {
    members, auth, fields,
    isFetching
  }
}



export default connect(mapStateToProps)(MemberView);

