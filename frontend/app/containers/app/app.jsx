import _ from 'lodash';

import React from 'react';
import { connect } from 'react-redux';
import * as mdl from 'react-mdl'
import { Link } from 'react-router';

import {fetch as peopleFetch} from 'redux/modules/people';
import {fetch as groupsFetch} from 'redux/modules/groups';
import {fetch as fieldsFetch} from 'redux/modules/fields';

// Action imports
import { push } from 'react-router-redux'

import logo from 'img/logo.svg';

@connect(
    state => ({
        auth: state.get('auth').toJS(),
        people: state.get('people').toJS(),
        fields: state.get('fields').toJS(),
        groups: state.get('groups').toJS()
    }), {
        push: push,
        peopleFetch,
        groupsFetch,
        fieldsFetch
    })
export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 0
        }

        this.handleTab = this.handleTab.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        if (!this.props.auth.loggedIn && nextProps.auth.loggedIn) {
            // login
            this.props.push('/');

            // Trigger fetch
            this.props.peopleFetch()
            this.props.groupsFetch()
            this.props.fieldsFetch()

        } else if (this.props.auth.loggedIn && !nextProps.auth.loggedIn) {
            // logout
            this.props.push('/login');
        }
    }

    handleTab(tab) {
        this.setState({
            activeTab: tab
        });
    }

    setPage(page) {
        return () => 
            this.setState({
                currentPage: page
            });
    }

    render() {
        var {main, header, auth } = this.props;

        return (
            <mdl.Layout fixedHeader fixedDrawer>
                <mdl.Header >
                    <mdl.HeaderRow>
                        {header}
                    </mdl.HeaderRow>
                </mdl.Header>
                <mdl.Drawer>
                    <header>
                        <img src={logo} />
                    </header>

                    <mdl.Navigation>
                        {auth.loggedIn ? [
                            (<Link key="mensen" to="/mensen">Mensen</Link>),
                            (<Link key="wijzig" to="/wijzig">Wijzig gegevens</Link>),
                            (<Link key="velden" to="/velden">Velden</Link>),
                            (<Link key="groepen" to="/groepen">Groepen</Link>),
                            (<Link key="permissies" to="/permissies">Permissies</Link>),
                            (<Link key="logout" to="/logout">Log uit</Link>)
                        ] : (
                            <Link to="/login">Log in</Link>
                        )}
                    </mdl.Navigation>
                </mdl.Drawer>
                <mdl.Content className="mdl-color--grey-100">
                    {main}
                </mdl.Content>
            </mdl.Layout>

        );
    }
}

