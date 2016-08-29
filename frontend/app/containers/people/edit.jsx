import React, { PropTypes } from 'react';
import { connectResources, PeopleResource } from 'resources';

@connectResources({
  people: PeopleResource,
})
export default class PersonEdit extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    people: PropTypes.object,
  };

  render() {
    const { params, people } = this.props;
    // Get the person to be edited, either params.id or self.
    const person = people.get(params.id, people.self);

    return people.renderItemEdit(person);
  }
}
