import _ from 'lodash'
import _initialState from './permissions.state.json'
import Immutable from 'immutable'

const initialState = Immutable.fromJS(_initialState);

const SET = 'pms/permissions/SET';
const CHANGE = 'pms/permissions/CHANGE';

export function change(change) {
  return {
    name: CHANGE,
    data: change
  }
}

const reducers = {
	[SET]: (permissions) => 
		permissions,

	[CHANGE]: (permissions, {data}) =>
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


export default (state=initialState, action) => 
  _.get(
    reducers, 
    action.type,   // Get type reducer
    state => state // Default passtrough
  )(state, action)
