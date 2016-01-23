
const initialState = []

function update(state = initialState, action) {
	switch (action.type) {
		case 'RECEIVE_MEMBERS':
			return action.members;
		default:
			return state;
	}
}


export default update