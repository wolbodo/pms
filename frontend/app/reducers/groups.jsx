import _ from 'lodash'
import Immutable from 'immutable'

const reducers = {
  CONSTRUCT: () => Immutable.fromJS({
    items: {
        bestuur: {
          "id": "bestuur",
          "name": "Bestuur",
          "description": "Alle bestuursleden"
        },
        leden: {
          "id": "leden",
          "name": "Leden",
          "description": "Alle leden"
        },
        oudleden: {
          "id": "oudleden",
          "name": "Oud Leden",
          "description": "Alle oud leden"
        }
    },
    updates: {},
    dirty: false
  }),

  GROUPS_CREATE: (groups, {data}) => 
      groups.mergeDeep({
          items: {
              [data.id]: {}
          }
      }),

  GROUPS_UPDATE: (groups, {data}) => 
      groups.mergeDeep({
          items: {
              [data.id]: data.group
          },
          updates: {
            [data.id]: data.group
          }
      })

}


export default (state = reducers.CONSTRUCT(), action) => {
  let reducer = _.get(reducers, action.type);
  if (reducer) {
    return reducer(state, action);
  } 
  return state;
}