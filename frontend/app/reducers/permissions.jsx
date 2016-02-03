import initialState from './permissions.state.json'
import Immutable from 'immutable'

let CONSTRUCT,
	PERMISSION_SET,
	PERMISSION_CHANGE

CONSTRUCT = () => 
	Immutable.fromJS(initialState)

PERMISSION_SET = (permissions) => 
	permissions

PERMISSION_CHANGE = (permissions, {data}) =>
	permissions.updateIn([data.group.id, 'read'], 
		readperms => data.read ? 
			Immutable.Set(readperms).add(data.field.name)
		  : Immutable.Set(readperms).remove(data.field.name)
		)
		.updateIn([data.group.id, 'write'], 
		writeperms => data.write ? 
			Immutable.Set(writeperms).add(data.field.name)
		  : Immutable.Set(writeperms).remove(data.field.name)
		)


export {
	CONSTRUCT,
	PERMISSION_SET,
	PERMISSION_CHANGE
}