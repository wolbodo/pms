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
  groups: state.get('groups').toJS()
}), {
  pushState: push
})
export default class PeopleView extends React.Component {

  static propTypes = {
    fields: PropTypes.object,
    groups: PropTypes.object,
    people: PropTypes.object,
    pushState: PropTypes.func,

    routeParams: PropTypes.object,
  };
  static defaultProps = {
    people: []
  };

  loaded() {
    const { fields, groups } = this.props;

    return fields.loaded && groups.loaded;
  }

  render() {
    if (!this.loaded()) {
      return (<h1>Loading</h1>);
    }
    const {
      people, fields, groups,
      pushState, routeParams } = this.props;
    const schema = _.get(fields, 'items.people');

    // merge items with updated items.
    const items = _.merge(people.items, people.updates);

    // Get the current group/role
    const currentGroup = _.find(groups.items, (group) =>
                                              group.name === (routeParams.group_name || 'member'));

    // Create a select title ;)
    const title = (
      <fieldComponents.Enum
        value={currentGroup.name}
        options={_.fromPairs(_.map(groups.items, ({ name }) => [name, name]))}
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
        {_.map(
          _.filter(items, (person) => _.includes(currentGroup.people_ids, person.id)),
          (person) => (
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
