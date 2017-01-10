import _ from 'lodash';
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  roles,
  people,
  fields,
  permissions,
  Login,
  PasswordReset,
  App,
  HeaderBar
} from 'containers';

import * as authActions from 'redux/modules/auth';
import clearState from 'redux/modules/clearState';

import * as peopleActions from 'redux/modules/people';
import * as rolesActions from 'redux/modules/roles';
import * as fieldsActions from 'redux/modules/fields';


// Create a mapping for resourcetypes...
const actions = {
  people: peopleActions,
  roles: rolesActions,
  fields: fieldsActions,
};
function fetchResources(store, ...resources) {
  return () => {
    const state = store.getState();

    if (state.hasIn(['auth', 'token'])) {
      // User is logged in

      _.each(resources, (resource) => {
        if (_.has(actions, resource)) {
          if (!state.getIn([resource, 'loaded']) || state.getIn([resource, 'fetching'])) {
            // fetch resource
            store.dispatch(actions[resource].fetch());
          }
        }
      });
    }
  };
}

function requireLogin(store) {
  return (nextState, replaceState) => {
    const state = store.getState();

    if (!state.getIn(['auth', 'loggedIn'])) {
      replaceState('/login');
    }
  };
}

function logout(store) {
  return (nextState, replaceState) => {
    store.dispatch(authActions.logout());
    store.dispatch(clearState());

    replaceState('/login');
  };
}

export default (store) => (
  <Route path="/"
    component={App}
    onEnter={fetchResources(store, 'people', 'roles', 'fields')}
  >
    <IndexRoute
      name="Lijst"
      components={{ main: people.View, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Mensen"
      path="mensen(/:role_name)"
      components={{ main: people.View, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Lid"
      path="lid-:id"
      components={{ main: people.Edit, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Wijzig"
      path="wijzig"
      components={{ main: people.Edit, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Velden"
      path="/velden"
      components={{ main: fields.Overview, header: HeaderBar }}
      onEnter={requireLogin(store)}
    >
      <Route
        name="Veld overzicht"
        path=":resource"
        components={{ content: fields.View }}
        onEnter={requireLogin(store)}
      />
      <Route
        name="Veld edit"
        path=":resource/:veld"
        components={{ content: fields.Edit }}
        onEnter={requireLogin(store)}
      />
    </Route>
    <Route
      name="Groepen"
      path="groepen"
      components={{ main: roles.View, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Groep"
      path="groepen/:groep"
      components={{ main: roles.Edit, header: HeaderBar }}
      onEnter={requireLogin(store)}
    />
    <Route
      name="Permissies"
      path="permissies"
      components={{ main: permissions.View, header: HeaderBar }}
      onEnter={fetchResources(store, 'people', 'roles', 'fields', 'permissions')}
    />
    <Route
      name="Login"
      path="login"
      components={{ main: Login }}
    />
    <Route
      name="Logout"
      path="logout"
      onEnter={logout(store)}
    />
    <Route
      name="Password reset"
      path="password_reset/:token"
      components={{ main: PasswordReset }}
    />
  </Route>
);
