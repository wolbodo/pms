import React, { PropTypes } from 'react';

import { List, Head, Row } from 'components/list';

import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import _ from 'lodash';
import fieldComponents from 'components/fields';

@connect((state) => ({
  people: state.get('people').toJS(),
  auth: state.get('auth').toJS(),
  fields: state.get('fields').toJS(),
  roles: state.get('roles').toJS()
}), {
  pushState: push
})
export default class PeopleView extends React.Component {

  static propTypes = {
    fields: PropTypes.object,
    roles: PropTypes.object,
    people: PropTypes.object,
    pushState: PropTypes.func,

    routeParams: PropTypes.object,
  };
  static defaultProps = {
    people: []
  };

  loaded() {
    const { fields, roles } = this.props;

    return fields.loaded && roles.loaded;
  }

  render() {
    if (!this.loaded()) {
      return (<h1>Loading</h1>);
    }

    const {
      people, fields, roles,
      pushState, routeParams } = this.props;
    const schema = _.get(fields, 'items.people');

    // merge items with updated items.
    const items = _.mergeWith(people.items, people.updates, (obj, src) =>
                                (_.isArray(obj) ? src : undefined));

    // Get the current role/role
    const currentRole = _.find(roles.items, (role) =>
                                              role.name === routeParams.role_name);

    // filter people in current role
    const peopleSet = currentRole
                    ? _.filter(items, (person) =>
                        _.some(person.roles, _.matches({ $ref: `/roles/${currentRole.id}` }))
                      )
                    : items;

    // Create a select title ;)
    const title = (
      <fieldComponents.Enum
        value={_.get(currentRole, 'name', 'all')}
        permissions={{ edit: true }}
        options={_.fromPairs(_.map(roles.items, ({ name }) => [name, name]))}
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
        <Head schema={schema} editLink />
        {_.map(peopleSet, (person) => (
          <Row
            className="click"
            key={person.id}
            item={person}
            fields={schema.header}
            edit={() => pushState(`/lid-${person.id}`)}
          />
        ))}
      </List>
    );
  }
}
