import initialState from './permissions.state.json'
import Immutable from 'immutable'

let CONSTRUCT,
	PERMISSION_SET

CONSTRUCT = () => 
	Immutable.fromJS(initialState)

PERMISSION_SET = (permissions) => 
	permissions


export {
	CONSTRUCT,
	PERMISSION_SET
}