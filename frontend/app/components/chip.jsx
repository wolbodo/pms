import React from 'react';

const style = {}


export default class Chip extends React.Component {
	render() {
		let { children } = this.props
		return (
			<div className='chip' style={style}>
				{children}
			</div>
		)
	}
}