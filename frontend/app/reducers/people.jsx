import {fromJS, Map} from 'immutable'

let CONSTRUCT,
    PEOPLE_RECEIVE,
    PEOPLE_UPDATE,
    FIELDS_CREATE_PEOPLE_COMMIT,
    PEOPLE_CREATE

CONSTRUCT = () => fromJS({
  items: {},
  updates: {},
  dirty: false
})

PEOPLE_RECEIVE = (people, {data}) =>
  people.merge({
    items: fromJS(data.people)
                    .reduce(
                      (lookup, item) => lookup.set(item.get('id').toString(), item),
                      Map()
                    )
  })

PEOPLE_UPDATE = (people, {data}) => {
  console.log("PEOPLE_UPDATE", people.toJS(), data)
  if (!fromJS(data.person).equals(
    people.getIn(['items', data.id])
  )) {
    // changed
    return people.updateIn(['items', data.id], person => (person || Map()).mergeDeep(data.person))
                  .update('updates', updates => updates.mergeDeep({[data.id]: data.person}))
  }
  return people
}

FIELDS_CREATE_PEOPLE_COMMIT = (people, {data}) =>
  people.merge({updates: undefined})
         .merge({updates: {}})
  
PEOPLE_CREATE = (people, {data}) =>
  people.update('items', items => items.merge({[data.id]: {id: data.id}}))


export {
  CONSTRUCT,
  PEOPLE_RECEIVE,
  PEOPLE_UPDATE,
  FIELDS_CREATE_PEOPLE_COMMIT,
  PEOPLE_CREATE
}