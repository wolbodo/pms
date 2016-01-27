
import React from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash'
import { connect } from 'react-redux';

class HeaderBar extends React.Component {
	render() {
		// `Immutable` types
		let {members, groups, fields} = this.props

		let changed = !_.isEmpty(members.updates) || !_.isEmpty(groups.updates) || !_.isEmpty(fields.updates)

		return (
			<div className='headerBar'>
				{ changed && (
				<mdl.Button ripple>
					Save
					<mdl.Icon name='more_vert' />
				</mdl.Button>
				)}
			</div>
		);
	}
}

function mapStateToProps(state) {
  return {
    ...state.app.toJS()
  }
}



export default connect(mapStateToProps)(HeaderBar);