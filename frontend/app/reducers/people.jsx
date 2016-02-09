import {fromJS, Map} from 'immutable'

let CONSTRUCT,
    PEOPLE_RECEIVE,
    PEOPLE_UPDATE,
    FIELDS_CREATE_PEOPLE_COMMIT,
    PERSON_UPDATE_SUCCESS,
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
    return people.update('updates', updates => updates.mergeDeep({[data.id]: data.person}))
  }
  return people
}

PERSON_UPDATE_SUCCESS = (people, {data}) =>
  people.updateIn(['items', data.id.toString()], 
                  person => person.mergeDeep(data))
        .deleteIn(['updates', data.id.toString()])

FIELDS_CREATE_PEOPLE_COMMIT = (people, {data}) =>
  people.merge({updates: undefined})
         .merge({updates: {}})
  
PEOPLE_CREATE = (people, {data}) =>
  people.update('updates', updates => updates.merge({[data.id]: {}}))


export {
  CONSTRUCT,
  PEOPLE_RECEIVE,
  PEOPLE_UPDATE,
  FIELDS_CREATE_PEOPLE_COMMIT,
  PERSON_UPDATE_SUCCESS,
  PEOPLE_CREATE
}