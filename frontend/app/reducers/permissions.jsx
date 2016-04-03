import _ from 'lodash'
import initialState from './permissions.state.json'
import Immutable from 'immutable'


const reducers = {
	CONSTRUCT: () => 
		Immutable.fromJS(initialState),

	PERMISSION_SET: (permissions) => 
		permissions,

	PERMISSION_CHANGE: (permissions, {data}) =>
		permissions.updateIn([data.group.id, data.schema, 'read'], 
			readperms => data.read ? 
				Immutable.Set(readperms).add(data.field.name)
			  : Immutable.Set(readperms).remove(data.field.name)
			)
			.updateIn([data.group.id, data.schema, 'write'], 
			writeperms => data.write ? 
				Immutable.Set(writeperms).add(data.field.name)
			  : Immutable.Set(writeperms).remove(data.field.name)
			)
}



export default (state = reducers.CONSTRUCT(), action) => {
  let reducer = _.get(reducers, action.type);
  if (reducer) {
    return reducer(state, action);
  } 
  return state;
}