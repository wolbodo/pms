import Immutable from 'immutable'

let CONSTRUCT,
    GROUPS_CREATE,
    GROUPS_UPDATE


CONSTRUCT = () => Immutable.fromJS({
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
})

GROUPS_CREATE = (groups, {data}) => 
    groups.mergeDeep({
        items: {
            [data.id]: {}
        }
    })


GROUPS_UPDATE = (groups, {data}) => 
    groups.mergeDeep({
        items: {
            [data.id]: data.group
        }
    })

export {
  CONSTRUCT,
  GROUPS_CREATE,
  GROUPS_UPDATE
}