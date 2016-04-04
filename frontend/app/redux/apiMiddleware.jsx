export default ({dispatch, getState}) => {
  return next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({...rest, type: REQUEST});

    const actionPromise = promise;

    // Check whether we're talking to the API, if so. add token to headers
    actionPromise.then(
      (result) => result.json()
                        .then(data => 
                          next({...rest, data, type: SUCCESS})
                        ),
      (error) => next({...rest, error, type: FAILURE})
    ).catch((error)=> {
      console.error('MIDDLEWARE ERROR:', error);
      next({...rest, error, type: FAILURE});
    });

    return actionPromise;
  };
}
