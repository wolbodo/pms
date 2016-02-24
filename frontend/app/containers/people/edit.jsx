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

        let person_id = params.id || auth.user.user
        let item = _.assign(
            people.items[person_id] || {},
            _.get(people, ['updates', person_id])
        );

        return (
            <ItemEdit
                schema={fields.schemas.person}
                item={item}
                permissions={permissions.bestuur.person}
                onChange={(value, key) => {
                    dispatch(actions.people.update(person_id, value, key))
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

