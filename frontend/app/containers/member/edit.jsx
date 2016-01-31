import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import * as mdl from 'react-mdl'

import {ItemEdit} from 'components';

import { connect } from 'react-redux';

import actions from 'actions'

export default class MemberEdit extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            params, dispatch,
            members, fields, auth, permissions
        } = this.props;

        // var data = _.find(stub, group => group.id === params.groep);

        let member_id = params.id || auth.user.user

        return (
            <ItemEdit
                schema={fields.schemas.member}
                item={members.items[member_id]}
                permissions={permissions.leden}
                onChange={member => {
                    console.log("Updating", member_id, member)
                    dispatch(actions.members.update(member_id, member))
                }} />
        );
    }
}



export default connect(
    function mapStateToProps(state) {
        const {
            members, fields, auth, permissions 
        } = state.app.toJS()

        return {
            members, fields, auth, permissions
        }

    })
    (MemberEdit);

