
import React from 'react'
import * as mdl from 'react-mdl'

import {List, Head, Row} from 'components/list'

import { Link } from 'react-router'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import _ from 'lodash'
import fieldComponents from 'components/fields'

@connect(state => ({
        people: state.get('people').toJS(),
        auth: state.get('auth').toJS(),
        fields: state.get('fields').toJS(),
        groups: state.get('groups').toJS()
    }), 
    {
        push
    }
)
export default class PeopleView extends React.Component {

    static renderHeaderButtons(actions) {
        return (
          <mdl.Button onTouchTap={() => actions.create()}>
            Nieuw persoon
          </mdl.Button>
        )
    }

    static defaultProps = {
        people: []
    };

    loaded() {
        const {fields, groups} = this.props

        return fields.loaded && groups.loaded
    }
    
    constructor(props) {
        super(props)
    }

    render() {
        if (!this.loaded()) {
            return (<h1>Loading</h1>)
        }

        var headerfields = ['nickname', 'firstname', 'lastname', 'city', 'gender',
                        'mobile', 'email'];

        const {history, people, fields, groups, push} = this.props

        // merge items with updated items.
        let items = _.merge(people.items, people.updates)

        // Create a select title ;)
        let title = (
            <fieldComponents.Enum
                value={_.get(this.props, 'routeParams.group_name', 'leden')}
                options={_.mapValues(groups.items, group => group.name)}
                style={{fontSize:'22px', fontWeight:'bold', lineHeight:'34px'}}
                onBlur={param => push('/mensen/' + param)}/>
        )

        return (
            <List title={title}>
                <Head schema={fields.items.people} fields={headerfields} editLink/>
                {_.map(items, (row, i) => (
                    <Row 
                        className="click"
                        key={i} 
                        item={row} 
                        fields={headerfields} 
                        edit={() => push(`/lid-${i}`)} />
                ))}
            </List>
        )
    }
}
