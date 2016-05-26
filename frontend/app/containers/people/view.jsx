import React, { PropTypes } from 'react';

import { List, Head, Row } from 'components/list';

import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import _ from 'lodash';
import fieldComponents from 'components/fields';

import { connectResources, PeopleResource, RolesResource } from 'resources';

@connect(...connectResources(
  {
    people: PeopleResource,
    roles: RolesResource,
  }, { pushState: push }))
export default class PeopleView extends React.Component {

  static propTypes = {
    roles: PropTypes.object,
    people: PropTypes.object,
    pushState: PropTypes.func,

    routeParams: PropTypes.object,
  };
  static defaultProps = {
    people: []
  };

  loaded() {
    const { people, roles } = this.props;

    return people.loaded && roles.loaded;
  }

  render() {
    if (!this.loaded()) {
      return (<h1>Loading</h1>);
    }

    const {
      people, roles,
      pushState, routeParams } = this.props;

    // Get the current role/role
    const currentRole = roles.find((value) => value.get('name') === routeParams.role_name);

    // filter people in current role
    const peopleSet = currentRole ?
      people.filter(
        (person) => person.get('roles')
                          .some((role) => role.$ref === `/roles/${currentRole.id}`)
      ) : people.all();

    // Create a select title ;)
    const title = (
      <fieldComponents.Enum
        value={_.get(currentRole, 'name', 'all')}
        permissions={{ edit: true }}
        options={
          roles.items
               .map((role) => role.get('name'))
               .toMap()
               .flip()
               .map((value, key) => key).toJS()
        }
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          lineHeight: '34px'
        }}
        onBlur={(param) => pushState(`/mensen/${param}`)}
      />
    );

    return (
      <List title={title}>
        <Head schema={people.schema} editLink />
        {_.map(peopleSet, (person) => (
          <Row
            className="click"
            key={person.id}
            item={person}
            fields={people.schema.header}
            edit={() => pushState(`/lid-${person.id}`)}
          />
        ))}
      </List>
    );
  }
}
