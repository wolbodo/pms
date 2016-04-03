import _ from 'lodash'
import {fromJS, Map, List} from 'immutable'

const reducers = {
  CONSTRUCT: () => fromJS({
    items: {},
    updates: {},
    dirty: false
  }),

  PEOPLE_RECEIVE: (people, {data}) =>
    people.merge({
      items: fromJS(data.people)
              .reduce(
                (lookup, item) => lookup.set(item.get('id').toString(), item),
                Map()
              )
    }),

  PEOPLE_UPDATE: (people, {data}) => {
    return people.updateIn(['updates', data.id, data.key], () => data.value)
  },

  PERSON_UPDATE_SUCCESS: (people, {data}) =>
    people.updateIn(['items', data.id.toString()], 
                    person => (person || Map()).merge(data)),

  PEOPLE_COMMIT_UPDATES: people =>
    people.set('updates', Map()),

  PEOPLE_REVERT_UPDATES: people =>
    people.set('updates', Map()),
    
  PEOPLE_CREATE: (people, {data}) =>
    people.update('updates', updates => updates.merge({[data.id]: {}}))
}


export default (state = reducers.CONSTRUCT(), action) => {
  let reducer = _.get(reducers, action.type);
  if (reducer) {
    return reducer(state, action);
  } 
  return state;
}