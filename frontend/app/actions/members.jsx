import $fetch from 'isomorphic-fetch'

// export function selectReddit(members) {
//   return {
//     type: SELECT_REDDIT,
//     reddit
//   }
// }

// export function invalidateReddit(reddit) {
//   return {
//     type: INVALIDATE_REDDIT,
//     reddit
//   }
// }

export function request(members) {
  return {
    type: 'REQUEST_MEMBERS',
    members
  }
}

function receive(members) {
  return {
    type: 'RECEIVE_MEMBERS',
    members: members,
    receivedAt: Date.now()
  }
}

export function fetch(token) {
  return dispatch => {
    dispatch(request())
    return $fetch("/api/members", {
				headers: new Headers({
					"Authorization": token
				})
			})
      .then(response => response.json())
      .then(json => dispatch(receive(json)))
  }
}

// function shouldFetch(state, members) {
//   const posts = state.members[members]
//   if (!posts) {
//     return true
//   }
//   if (posts.isFetching) {
//     return false
//   }
//   return posts.didInvalidate
// }

// export function fetchIfNeeded(members) {
// 	fetch
// 	debugger;
//   return (dispatch, getState) => {
//     // if (shouldFetch(getState(), members)) {
//       return dispatch(fetch(members))
//     }
//   }
// }