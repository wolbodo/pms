import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import ItemEdit from '../view/itemEdit';

import schema from './schema';
import stub from './stub';


export default class GroupEdit extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {

		const {groep} = this.props.params;


		var data = _.find(stub, group => group.id === groep);

		return (
			<ItemEdit
				schema={schema}
				item={data} />
		);
	}
}