import _ from 'lodash';
import fetch from 'isomorphic-fetch';

export default function API({ uri, options = {}, types, ...rest }) {
  const _options = { ...options };
  const headers = _options.headers || new Headers();

  if (_.has(_options, 'body')) {
    _options.body = JSON.stringify(_options.body);
    headers.set('Content-Type', 'application/json');
    _options.method = _.get(_options, 'method', 'POST');
  }

  return (dispatch, getState) => {
    const token = getState().getIn(['auth', 'token']);
    if (token) {
      headers.set('Authorization', token);
    }

    dispatch({
      types,
      uri,
      ...rest,
      promise: fetch(`/api/${uri}`, {
        ..._options,
        headers
      })
    });
  };
}
