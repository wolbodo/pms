import constants from 'constants'



export function createSet(schema, fromIndex, toIndex) {
	return {
		type: constants.FIELDS_CREATE_FIELDSET,
		schema, fromIndex, toIndex
	}
}


export function moveField(schema, fromIndex, toIndex) {
	// Moves field in schema 
	return {
		type: constants.FIELDS_MOVE_SCHEMAFIELD,
		schema,
		fromIndex,
		toIndex
	}
}

export function updateField(schema, id, field) {
	return {
		type: constants.FIELDS_UPDATE_FIELD,
		schema, id, field
	}
}