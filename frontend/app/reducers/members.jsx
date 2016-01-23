import _ from  'lodash'


const initialState = {
  items: {}
}

function update(state = initialState, action) {
  switch (action.type) {
    case 'RECEIVE_MEMBERS':
      return Object.assign({}, state, {
        items: _.indexBy(action.members, 'id')
      })
    default:
      return state;
  }
}


export default update