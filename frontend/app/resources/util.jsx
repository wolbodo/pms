
import _ from 'lodash';
import FieldsResource from './fields';

export function memoizeMethod(target, name, description) {
  // TODO: Only cache the last call, since state rarely repeats.
  return _.memoize(description.value);
}

export function connectResources(resources, defaultActions = {}) {
  // ActionCreators select the resources to map...

  // Make sure fields are in the resources
  const _resources = { fields: FieldsResource, ...resources };
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
    _.each(stateResources, (resource) => resource.setDispatch(dispatch));

    return _.mapValues(
      defaultActions,
      (action) => _.flow(action, dispatch)
    );
  }

  return [
    mapStateToProps,
    mapDispatchToProps
  ];
}
