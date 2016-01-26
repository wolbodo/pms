
import React from 'react';
import * as mdl from 'react-mdl';
import { connect } from 'react-redux';

class HeaderBar extends React.Component {
	render() {
		// `Immutable` types
		let {members, groups, fields} = this.props

		let changed = !members.get('updates').isEmpty() || !groups.get('updates').isEmpty() || !fields.get('updates').isEmpty()

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
    ...state.app
  }
}



export default connect(mapStateToProps)(HeaderBar);