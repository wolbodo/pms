import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'

import {ItemEdit} from 'components';

import { connect } from 'react-redux';

import actions from 'actions'

export default class PersonEdit extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            params, dispatch,
            people, fields, auth, permissions
        } = this.props;

        // var data = _.find(stub, group => group.id === params.groep);

        let person_id = params.id || auth.user.user

        return (
            <ItemEdit
                schema={fields.schemas.person}
                item={people.items[person_id]}
                permissions={permissions.leden.person}
                onChange={person => {
                    console.log("Updating", person_id, person)
                    dispatch(actions.people.update(person_id, person))
                }} />
        );
    }
}



export default connect(
    function mapStateToProps(state) {
        const {
            people, fields, auth, permissions 
        } = state.app.toJS()

        return {
            people, fields, auth, permissions
        }

    })
    (PersonEdit);

