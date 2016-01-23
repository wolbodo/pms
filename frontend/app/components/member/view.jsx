
import React from 'react';

import {List, Head, Row} from '../view/list';
import schema from './schema.json';
import API from '../../api';
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

	render() {
		var fields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
						'mobile', 'email'];

		const {history, members} = this.props;

		return (
			<List title="Leden">
				<Head schema={schema} fields={fields} editLink/>
				{members.map((row, i) => (
					<Row 
						className="click"
						key={i} 
						item={row} 
						fields={fields} 
						edit={() => history.push(`/lid-${row.id}`)} />
				))}
			</List>
		);
	}
};


function mapStateToProps(state) {
  const { members, auth } = state
  const isFetching = false

  return {
    members, auth,
    isFetching
  }
}



export default connect(mapStateToProps)(MemberView);

