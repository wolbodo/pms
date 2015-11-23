import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import { Link } from 'react-router'

import _ from 'lodash';

export default class ListView extends React.Component {

	static defaultProps = {
		// structure
		// data
	}

	constructor(props) {
		super(props);
	}

    componentDidMount() {
		// For loading mdl
        componentHandler.upgradeElement(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
		// For loading mdl
        componentHandler.downgradeElements(ReactDOM.findDOMNode(this));
    }

    _getCellClass(column) {
    	var classes = [];

    	if (!column.numeric)  classes.push('mdl-data-table__cell--non-numeric');
    	// if (column.icon) classes.push('material-icons');

        return classes.join(' ');
    }

    render() {
    	const {fields, schema, data} = this.props;

		return (
		<mdl.Grid className='main-content'>
			<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
				<table className='mdl-data-table mdl-js-data-table'>
					<thead>
						<tr>
							{fields.map(field => (
								<th key={field} className={this._getCellClass(field)}>{schema.fields[field].label}</th>
 							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, i) => {
							return (
								<tr key={row.name ? row.name : i}>
									{fields.map(field => (
										<td key={field} className={this._getCellClass(field)}>
											{ row[field] }
										</td>
									))}

									<td>
										<Link to='./edit'><i className='icon'>edit</i></Link>
									</td>
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

