

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



(function() {
  function status(response) {
    if (response.ok) {
      return response
    } else {
      var error = new Error(response.statusText || response.status)
      error.response = response
      throw error
    }
  }

  function headers(options) {
    options = options || {}
    options.headers = options.headers || {}
    options.headers['X-Requested-With'] = 'XMLHttpRequest'
    return options
  }
  
  function credentials(options) {
    if (options == null) {
      options = {}
    }
    if (options.credentials == null) {
      options.credentials = 'same-origin'
    }
    return options
  }

  function json(response) {
    return response.json()
  }

  function text(response) {
    return response.text()
  }

  $.fetch = function(url, options) {
    options = headers(credentials(options))
    return fetch(url, options).then(status)
  }

  $.fetchText = function(url, options) {
    options = headers(credentials(options))
    return fetch(url, options).then(status).then(text)
  }

  $.fetchJSON = function(url, options) {
    options = headers(credentials(options))
    options.headers['Accept'] = 'application/json'
    return fetch(url, options).then(status).then(json)
  }
  
  $.fetchPoll = function(url, options) {
    return new Promise(function(resolve, reject) {
      function poll(wait) {
        function done(response) {
          switch (response.status) {
            case 200:
              resolve(response)
              break
            case 202:
              setTimeout(poll, wait, wait * 1.5)
              break
            default:
              var error = new Error(response.statusText || response.status)
              error.response = response
              reject(error)
              break
          }
        }
        $.fetch(url, options).then(done, reject)
      }
      poll(1000)
    })
  }
}).call(this);