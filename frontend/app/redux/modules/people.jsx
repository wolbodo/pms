import _ from 'lodash'
import _fetch from 'isomorphic-fetch'
import {fromJS, Map, List} from 'immutable'

import API from 'redux/apiWrapper'
import {CLEAR} from './clearState'

const initialState = fromJS({
  items: {},
  updates: {},
  fetching: false,
  pushing: false
});

const FETCH = 'pms/people/FETCH';
const FETCH_SUCCESS = 'pms/people/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/people/FETCH_FAIL';

const PUSH = 'pms/people/PUSH';
const PUSH_SUCCESS = 'pms/people/PUSH_SUCCESS';
const PUSH_FAIL = 'pms/people/PUSH_FAIL';

const UPDATE = 'pms/people/UPDATE'
const REVERT = 'pms/people/REVERT';
const CREATE = 'pms/people/CREATE';

const COMMIT_FINISHED = 'pms/people/COMMIT_FINISHED';

export function fetch() {
  return API({
    types: [FETCH, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'people'
  });
}

export function update(id, value, key) {
  return {
    type: UPDATE,
    data: {
      id: id.toString(), 
      value, key
    }
  }
}

export function create() {
  return dispatch => {
    let id = Date.now()
    dispatch({
      type: CREATE,
      data: {
        id: id.toString()
      }
    })
    dispatch(push(`/lid-${id}`))
  }
}

export function revert() {
  return {
    type: REVERT
  }
}

export function commit() {
  return (dispatch, getState) => {
    let people = getState().get('people')
    // Save all updates
    people.get('updates')
          .map((person, i) => 
              // Add or update person, whether gid exists.
              people.hasIn(['items', i])
                // Existing person
               ? dispatch(API({
                  types: [PUSH, PUSH_SUCCESS, PUSH_FAIL],
                  uri: `person/${i}`,
                  options: {
                    method: 'PUT',
                    body: person
                  }
                }))
               // New person
               : dispatch(API({
                  types: [PUSH, PUSH_SUCCESS, PUSH_FAIL],
                  uri: 'people',
                  options: {
                    body: person
                  }
                }))
          );

    // Clear updates locally
    // FIXME: Clear when all commits were successfull.
    dispatch({
      type: COMMIT_FINISHED
    });


  }
}

const reducers = {
  [FETCH]: people => 
    people.merge({fetching: true}),

  [FETCH_SUCCESS]: (people, {data}) =>
    // Create an indexed object with key = Object id
    people.mergeDeep({
      fetching: false,
      loaded: true, // Only set initially, So the ui know it has data.
      items: data
    }),

  [FETCH_FAIL]: (people, {error}) =>
    people.merge({fetching: false, error}),


  [PUSH]: (people) => 
    people.merge({pushing: true}),

  [PUSH_SUCCESS]: (people, {data}) =>
    people.mergeDeep({
      pushing: false,
      'items': {
        [data.id]: data
      }
    }),

  [PUSH_FAIL]: (people, {error}) => 
    people.merge({
      pushing: false
    }),

  [COMMIT_FINISHED]: people =>
    people.set('updates', Map()),

  [REVERT]: people =>
    people.set('updates', Map()),
    
  [UPDATE]: (people, {data}) =>
    people.updateIn(['updates', data.id, data.key], () => data.value),

  [CREATE]: (people, {data}) =>
    people.update('updates', updates => updates.merge({[data.id]: {}})),
    
  [CLEAR]: state => initialState
}

export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
