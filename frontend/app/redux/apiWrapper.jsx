import _ from 'lodash'
import fetch from 'isomorphic-fetch'

export default function API({uri, options={}, types, ...rest}) {
  const headers = options.headers || new Headers();

  if (_.has(options, 'body')) {
    options.body = JSON.stringify(options.body);
    headers.set('Content-Type', 'application/json');
    options.method = _.get(options, 'method', 'POST');
  }

  return (dispatch, getState) => {
    const token = getState().getIn(['auth', 'token'])
    if (token) {
      headers.set('Authorization', token)
    }

    dispatch({
      types,
      uri,
      ...rest,
      promise: fetch(`/api/${uri}`, {
        ...options,
        headers: headers
      })
    })

  }
}
