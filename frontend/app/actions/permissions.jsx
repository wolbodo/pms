

export function changePermission(change) {
	return {
		name: 'PERMISSION_CHANGE',
		data: change
	}
}