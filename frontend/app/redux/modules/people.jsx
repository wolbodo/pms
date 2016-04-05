import _ from 'lodash'
import _fetch from 'isomorphic-fetch'
import {fromJS, Map, List} from 'immutable'

import API from 'redux/apiWrapper'

const initialState = fromJS({
  items: {},
  updates: {},
  dirty: false
});

const FETCH_START = 'pms/people/FETCH_START';
const FETCH_SUCCESS = 'pms/people/FETCH_SUCCESS';
const FETCH_FAIL = 'pms/people/FETCH_FAIL';

const UPDATE_START = 'pms/people/UPDATE_START';
const UPDATE_SUCCESS = 'pms/people/UPDATE_SUCCESS';
const UPDATE_FAIL = 'pms/people/UPDATE_FAIL';

const CREATE_START = 'pms/people/CREATE_START';
const CREATE_SUCCESS = 'pms/people/CREATE_SUCCESS';
const CREATE_FAIL = 'pms/people/CREATE_FAIL';

const LOCAL_UPDATE = 'pms/people/LOCAL_UPDATE'
const LOCAL_REVERT = 'pms/people/LOCAL_REVERT';
const LOCAL_CREATE = 'pms/people/LOCAL_CREATE';

const COMMIT_FINISHED = 'pms/people/COMMIT_FINISHED';

export function fetch() {
  return API({
    types: [FETCH_START, FETCH_SUCCESS, FETCH_FAIL],
    uri: 'people'
  });
}

export function update(id, value, key) {
  return {
    type: LOCAL_UPDATE,
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
      type: LOCAL_CREATE,
      data: {
        id: id.toString()
      }
    })
    dispatch(push(`/lid-${id}`))
  }
}

export function revert() {
  return {
    type: LOCAL_REVERT
  }
}

export function commit() {
  return (dispatch, getState) => {
    let people = getState().get('people')
    // Save all updates
    people.get('updates')
          .map((person, i) => 
              // Add or update person, whether gid exists.
              people.hasIn(['items', i, 'gid'])
               ? dispatch(API({
                  types: [UPDATE_START, UPDATE_SUCCESS, UPDATE_FAIL],
                  uri: `person/${i}`,
                  options: {
                    method: 'PUT',
                    body: person
                  }
                }))
               : dispatch(API({
                  types: [CREATE_START, CREATE_SUCCESS, CREATE_FAIL],
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
  [FETCH_START]: people => people,
  [FETCH_SUCCESS]: (people, {data}) =>
    people.merge({
      items: fromJS(data)
              .reduce((lookup, item) => 
                lookup.set(item.get('id').toString(), item),
                Map()
              )
    }),
  [FETCH_FAIL]: people => people,

  [CREATE_SUCCESS]: (people, {data}) =>
    people.updateIn(['items', data.id.toString()], 
                    person => (person || Map()).merge(data)),
  [CREATE_START]: people => people,
  [CREATE_FAIL]: people => people,

  [UPDATE_SUCCESS]: (people, {data}) =>
    people.updateIn(['items', data.id.toString()], 
                    person => (person || Map()).merge(data)),
  [UPDATE_START]: people => people,
  [UPDATE_FAIL]: people => people,

  [COMMIT_FINISHED]: people =>
    people.set('updates', Map()),

  [LOCAL_REVERT]: people =>
    people.set('updates', Map()),
    
  [LOCAL_UPDATE]: (people, {data}) => {
    return people.updateIn(['updates', data.id, data.key], () => data.value)
  },

  [LOCAL_CREATE]: (people, {data}) =>
    people.update('updates', updates => updates.merge({[data.id]: {}}))
}

export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
