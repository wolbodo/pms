import React from 'react';
import mdl from 'react-mdl';
import _ from 'lodash';

export default class EditPopup extends React.Component {

	constructor(props) {
		super(props);
	}

    static defaultProps = {}


    renderField(id) {
    	return (
			<form className='content' onSubmit={this.handleSubmit}>
			</form>
		);
    } 
    renderRole(id) {
    	return (
			<form className='content' onSubmit={this.handleSubmit}>
			</form>
		);
    } 

	render() {

		var {rol_id, field_id} = this.props.params;
		var editSubject = this.props.route.path.match(/^(\w+)/)[0];
		var edit = rol_id || field_id; // whether we're editing or creatign a new one.

		return (
			<div className='popup'>
			<mdl.Card shadowLevel={3}>
				<mdl.CardTitle>
					{`${edit? 'Wijzig' : 'Een nieuwe'} ${editSubject}`}
				</mdl.CardTitle>
			
				{ rol_id ? this.renderRole(rol_id) : this.renderField(field_id) }
			</mdl.Card>
			</div>
		);
		
	}




}