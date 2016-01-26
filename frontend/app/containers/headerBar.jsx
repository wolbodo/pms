
import React from 'react';
import * as mdl from 'react-mdl';
import { connect } from 'react-redux';

class HeaderBar extends React.Component {
	render() {
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
    ...state
  }
}



export default connect(mapStateToProps)(HeaderBar);