
import _ from 'lodash';
import { connect } from 'react-redux';

import FieldsResource from './fields';
import RolesResource from './roles';

export function memoizeMethod(target, name, description) {
  // TODO: Only cache the last call, since state rarely repeats.
  return _.memoize(description.value);
}

export function connectResources(resources, defaultActions = {}) {
  // ActionCreators select the resources to map...

  // Make sure fields are in the resources
  const _resources = { fields: FieldsResource, roles: RolesResource, ...resources };
  let stateResources;

  function mapStateToProps(state) {
    // Pass state to the resources.

    // Keys in resources define the name on the state
    stateResources = _.mapValues(
      _resources,
      // Set state on each resourceType
      (type, key) => type.setState(state.get(key))
    );

    // Set resources on every state object so they can interact.
    _.each(stateResources, (resource) => resource.setResources(stateResources));
    _.each(stateResources, (resource) => resource.setAuth(state.get('auth')));

    return stateResources;
  }
  function mapDispatchToProps(dispatch) {
    // Map defaultActions to a flow connected with dispatch
    _.each(_resources, (resource) => resource.setDispatch(dispatch));

    return _.mapValues(
      defaultActions,
      (action) => _.flow(action, dispatch)
    );
  }

  const wrapper = connect(
    mapStateToProps,
    mapDispatchToProps
  );

  return function wrapComponent(component) {
    // Add a resource fetcher to the component
    const oldWillMount = component.prototype.componentWillMount;

    // TODO: Fix this uglyness. (but how?)
    /* eslint no-param-reassign: "off" */
    component.prototype.componentWillMount = function test() {
      // Trigger updates on resources
      _.each(stateResources, (resource) => resource.checkState());

      if (oldWillMount) {
        return oldWillMount.call(this);
      }
      return undefined;
    };

    const newComponent = wrapper(component);
    return newComponent;
  };
}
