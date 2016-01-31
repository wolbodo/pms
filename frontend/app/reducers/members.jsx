import {fromJS, Map} from 'immutable'

let CONSTRUCT,
    MEMBERS_RECEIVE,
    MEMBERS_UPDATE,
    FIELDS_CREATE_MEMBERS_COMMIT,
    MEMBERS_CREATE

CONSTRUCT = () => fromJS({
  items: {},
  updates: {},
  dirty: false
})

MEMBERS_RECEIVE = (members, {data}) =>
  members.merge({
    items: fromJS(data.members)
                    .reduce(
                      (lookup, item) => lookup.set(item.get('id').toString(), item),
                      Map()
                    )
  })

MEMBERS_UPDATE = (members, {data}) => {
  console.log("MEMBERS_UPDATE", members.toJS(), data)
  if (!fromJS(data.member).equals(
    members.getIn(['items', data.id])
  )) {
    // changed
    return members.updateIn(['items', data.id], member => (member || Map()).mergeDeep(data.member))
                  .update('updates', updates => updates.mergeDeep({[data.id]: data.member}))
  }
  return members
}

FIELDS_CREATE_MEMBERS_COMMIT = (members, {data}) =>
  members.merge({updates: {}})
  
MEMBERS_CREATE = (members, {data}) =>
  members.update('items', items => items.merge({[data.id]: {id: data.id}}))


export {
  CONSTRUCT,
  MEMBERS_RECEIVE,
  MEMBERS_UPDATE,
  FIELDS_CREATE_MEMBERS_COMMIT,
  MEMBERS_CREATE
}