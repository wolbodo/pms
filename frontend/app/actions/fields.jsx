import constants from 'constants'



export function createSet(schema, fromIndex, toIndex) {
	return {
		name: constants.FIELDS_CREATE_FIELDSET,
		data: {
			schema, fromIndex, toIndex
		}
	}
}


export function moveField(schema, fromIndex, toIndex) {
	// Moves field in schema 
	return {
		name: constants.FIELDS_MOVE_SCHEMAFIELD,
		data: {
			schema,
			fromIndex,
			toIndex
		}
	}
}

export function updateField(schema, id, field) {
	return {
		name: constants.FIELDS_UPDATE_FIELD,
		data: {
			id: parseInt(id, 10), 
			schema, 
			field
		}
	}
}