import React from 'react';

const style = {
    fontSize: '1em',
    borderRadius: '2em',
    backgroundColor: '#E0E0E0',
    display: 'inline',
    padding: '0.2em 1em',
    height: '2em',
    margin: '1em'
}


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