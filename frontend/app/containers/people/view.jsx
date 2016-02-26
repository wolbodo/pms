
import React from 'react'
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/list'

import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Navigation } from 'react-router'
import { routeActions } from 'react-router-redux'

import _ from 'lodash'
import fieldComponents from 'components/fields'
import actions from 'actions'

class PeopleView extends React.Component {

    static renderHeaderButtons(dispatch) {
        return (
          <mdl.Button onTouchTap={() => dispatch(actions.people.create())}>
            Nieuw persoon
          </mdl.Button>
        )
    }

    static defaultProps = {
        people: []
    };
    
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        var { dispatch, auth } =  this.props;
        dispatch(actions.people.fetch(auth.token))
    }

    render() {
        var headerfields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
                        'mobile', 'email'];

        const {history, people, fields, groups, dispatch} = this.props

        // merge items with updated items.
        let items = _.merge(people.items, people.updates)

        // Create a select title ;)
        let title = (
            <fieldComponents.Enum
                value={_.get(this.props, 'routeParams.group_name', 'leden')}
                options={_.mapValues(groups.items, group => group.name)}
                style={{fontSize:'22px', fontWeight:'bold', lineHeight:'34px'}}
                onBlur={param => dispatch(routeActions.push('/mensen/' + param))}/>
        )

        return (
            <List title={title}>
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
        )
    }
}


function mapStateToProps(state) {
  const isFetching = false

  return {
    people: state.app.get('people').toJS(),
    auth: state.app.get('auth').toJS(),
    fields: state.app.get('fields').toJS(),
    groups: state.app.get('groups').toJS(),
    isFetching
  }
}



export default connect(mapStateToProps)(PeopleView);

