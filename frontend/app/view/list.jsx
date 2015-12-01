import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import { Link } from 'react-router';

import _ from 'lodash';

export class List extends React.Component {

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


    render() {
    	const {fields, schema, data, title} = this.props;

    	const {heads, rows} = _.groupBy(_.flatten(this.props.children), function (child) {
    		return (child.type.name === "Head") ? "heads" : "rows";
    	})

		return (
			<mdl.Card className='content mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>
					{title || "Lijst"}
				</mdl.CardTitle>
				<mdl.CardText>
					<table className='mdl-data-table mdl-js-data-table'>
						<thead>
							{heads}
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
				</mdl.CardText>
			</mdl.Card>
		);
    }
}

export class Head extends React.Component {
	render() {
		const {schema, fields} = this.props;
		return (
			<tr>
				{fields.map(field => (
					<th key={field} className='mdl-data-table__cell--non-numeric'>{schema.fields[field].label}</th>
					))}
			</tr>);
	}
}


export class Row extends React.Component {
	render() {
		const {item, fields, editLink} = this.props;

		return (
		<tr key={item.name}>
			{fields.map(field => (
				<td key={field} className='mdl-data-table__cell--non-numeric'>
					{ item[field] }
				</td>
			))}

			<td>
				{ editLink && (
					<Link to={editLink}><i className='icon'>edit</i></Link>
				)}
			</td>
		</tr>);
	}
}

