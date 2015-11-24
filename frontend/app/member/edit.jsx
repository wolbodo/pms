import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import schema from './schema';


export default class MemberEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {member, params} = this.props;


		// var data = _.find(stub, group => group.id === params.groep);

		return (
			<ItemEdit
				schema={schema}
				item={member}/>
		);
	}
}