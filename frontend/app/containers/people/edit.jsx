import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'

import {ItemEdit} from 'components';

import { connect } from 'react-redux';

import actions from 'actions'

@connect(state => ({
    people: state.get('people').toJS(),
    fields: state.get('fields').toJS(),
    auth: state.get('auth').toJS(),
    permissions: state.get('permissions').toJS()
}), {
    update: actions.people.update
})
export default class PersonEdit extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            params, people, fields, auth, permissions,
            update
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
                    update(person_id, value, key)
                }} />
        );
    }
}
