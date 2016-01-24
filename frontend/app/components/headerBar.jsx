
import React from 'react';
import { connect } from 'react-redux';

class HeaderBar extends React.Component {
	constructor(props) {
		super(props);

	}

	componentDidMount() {
	}

	render() {
		let {members, groups, fields} = this.props
		return (
			<div className='headerbar'>
				{ members.dirty && (
					<p>Members dirty</p>
				)}
				{ groups.dirty && (
					<p>groups dirty</p>
				)}
				{ fields.dirty && (
					<p>fields dirty</p>
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