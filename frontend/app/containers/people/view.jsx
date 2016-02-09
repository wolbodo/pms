
import React from 'react'
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/list'
import { Link } from 'react-router'
import { Navigation } from 'react-router'
import { connect } from 'react-redux'

import _ from 'lodash'

import actions from 'actions'

class PeopleView extends React.Component {

    static defaultProps = {
        people: []
    };
    
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		var { dispatch, auth } =  this.props;
		dispatch(actions.people.fetch(auth.token))
	}

	renderButtons() {
		let {dispatch} = this.props;

		return (
			<mdl.IconButton 
				name="add"
				onClick={() => dispatch(actions.people.create())} />
		)
	}

	render() {
		var headerfields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
						'mobile', 'email'];

		const {history, people, fields} = this.props;

		// merge items with updated items.
		let items = _.merge(people.items, people.updates);

		return (
			<List title="Leden" buttons={this.renderButtons()}>
				<Head schema={fields.schemas.person} fields={headerfields} editLink/>
				{_.map(items, (row, i) => (
					<Row 
						className="click"
						key={i} 
						item={row} 
						fields={headerfields} 
						edit={() => history.push(`/lid-${i}`)} />
				))}
			</List>
		);
	}
};


function mapStateToProps(state) {
  const people = state.app.get('people').toJS(),
  		auth = state.app.get('auth').toJS(),
  		fields = state.app.get('fields').toJS(),
  		isFetching = false

  return {
    people, auth, fields,
    isFetching
  }
}



export default connect(mapStateToProps)(PeopleView);

