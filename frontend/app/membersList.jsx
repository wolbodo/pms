import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import memberForm from './form';

import _ from 'lodash';
import axios from 'axios';

export default class MembersList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			members: []
		};

		axios.get('/api/members')
		 .then(function (resp) {
			this.setState({
				members: resp.data
			});
		 }.bind(this));
	}

    componentDidMount() {
        componentHandler.upgradeElement(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        componentHandler.downgradeElements(ReactDOM.findDOMNode(this));
    }

    _getCellClass(column) {
    	var classes = [];

    	if (!column.numeric)  classes.push('mdl-data-table__cell--non-numeric');
    	// if (column.icon) classes.push('material-icons');

        return classes.join(' ');
    }


	render() {
		var columns = [
			{name: "nickname", label: "Bijnaam"},
			{name: "firstname", label: "Naam"},
			{name: "lastname", label: "Achternaam"},
			{name: "city", label:"Plaats"},
			{name: "mobile", label:"Mobiel"},
			{name: "email", label:"Email"},
			{name: "edit", icon: "edit"}
		];

		return (
		<mdl.Grid className='main-content'>
			<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
				<table className='mdl-data-table mdl-js-data-table'>
					<thead>
						<tr>
							{columns.map((column) => {
								return <th key={column.name} className={this._getCellClass(column)}>{column.label}</th>;
							})}
						</tr>
					</thead>
					<tbody>
						{this.state.members.map((e, i) => {
							return (
								<tr key={e.key ? e.key : i}>
									{columns.map((column) => (
										<td key={column.name} className={this._getCellClass(column)}>
											{ column.icon ? 
												(<i className='icon'>{column.icon}</i>) :
												e[column.name]
											}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</mdl.Cell>
		</mdl.Grid>
		);
	}
}