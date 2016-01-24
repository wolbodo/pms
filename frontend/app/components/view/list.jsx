import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import { Link } from 'react-router';

import _ from 'lodash';

export class List extends React.Component {

	static defaultProps = {
		// structure
		// data
	};

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
    	const {fields, schema, data, title, buttons} = this.props;

    	const {heads, rows} = _.groupBy(_.flatten(this.props.children), function (child) {
    		return (child.type.name === "Head") ? "heads" : "rows";
    	})

		return (
			<mdl.Card className='content mdl-color--white mdl-shadow--2dp'>
				<mdl.CardMenu>
					{buttons}
				</mdl.CardMenu>
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
		const {schema, fields, fieldLink} = this.props;
		return (
			<tr>
				{fields
					.map(fieldname => schema.fields[fieldname]) // get fields from the fieldname
					.map(field => (
					<th key={field.name} className='mdl-data-table__cell--non-numeric'>
					{
						fieldLink ? (
							<Link to={`${fieldLink}/${field.name}`}>{field.label}</Link>
						) : field.label
					}
					</th>
				))}
			</tr>);
	}
}


export class Row extends React.Component {
	render() {
		const {className, item, fields, edit} = this.props;
		return (
		<tr className={className} key={item.name} onClick={edit}>
			{fields.map((field, i) => (
				<td key={i} className='mdl-data-table__cell--non-numeric'>
					{ item[field] }
				</td>
			))}

		</tr>);
	}
}