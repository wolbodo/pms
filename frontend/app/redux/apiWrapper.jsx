import _ from 'lodash';
import fetch from 'isomorphic-fetch';

export function API(token, uri, options = {}) {
  const { headers = new Headers() } = options;
  let {
    method,
    body,
    ...rest
  } = options;

  if (token) {
    headers.set('Authorization', token);
  }

  if (!_.isEmpty(body)) {
    body = JSON.stringify(body);
    headers.set('Content-Type', 'application/json');
    method = method || 'POST';
  }

  return fetch(`/api/${uri}`, {
    method: method || 'GET',
    headers,
    body,
    ...rest
  });
}

export function apiAction({ uri, options = {}, types, ...rest }) {
  return (dispatch, getState) => {
    const token = getState().getIn(['auth', 'token']);

    dispatch({
      types,
      uri,
      ...rest,
      promise: API(token, uri, options)
    });
  };
}
