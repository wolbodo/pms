import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectResources, PeopleResource } from 'resources';

function PersonEdit({ params, people }) {
  // Get the person to be edited, either params.id or self.
  const person = people.get(params.id, people.self);

  return people.renderItemEdit(person);
}

PersonEdit.propTypes = {
  params: PropTypes.object,
  people: PropTypes.object,
};

export default connect(
  ...connectResources({
    people: PeopleResource,
  })
)(PersonEdit);
