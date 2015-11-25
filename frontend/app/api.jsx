

import _ from 'lodash';

import axios from 'axios';


var data = {};


const update = () => axios.get('/api/members')
		 .then(function (resp) {
		 	data.members = resp.data;
		 	return data.members;
		 })

var API = {

	get_members: function () {
		if (data.members) {
			return new Promise((resolve, reject) => 
				resolve(data.members)
			);
		} else {
			return update();
		}
	},
	get_member: id => API.get_members()
						 .then(members => 
						 	_.find(members, member => member.id === id)
						 )

};

export default API;

