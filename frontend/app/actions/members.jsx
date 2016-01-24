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
function receive(members) {
  return {
    type: 'RECEIVE_MEMBERS',
    members: members,
    receivedAt: Date.now()
  }
}




function shouldFetchMembers(state) {
  if (state.members.dirty) {
    return false
  } else {
    // check timestamp?
    return true
  }
}


export function fetch(token) {
  return (dispatch, getState) => {
    if ( shouldFetchMembers(getState()) ) {
      return $fetch("/api/members", {
  				headers: new Headers({
  					"Authorization": token
  				})
        })
        .then(response => response.json())
        .then(json => dispatch(receive(json)))
    }
  }
}

export function update(id, member) {
  return {
    type: "MEMBERS_UPDATE",
    id, member
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