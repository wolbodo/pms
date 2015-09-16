'use strict';

// Library file, random functions for mms

function wait(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, time);
  });
}

function API(url) {
  this.host = $http.server(url);
}
API.prototype.login = function (data) {
  return wait(0)
          .then(function () {
            return {id: 42};
          });

  return this.token(data)
         .then(this.self.bind(this));
}
API.prototype.token = function(data) {
  return this.host('token')
         .post(data)
         .then(function (res) {
          localStorage.setItem('authorization', btoa(res));

           return JSON.parse(res);
        });
};
API.prototype.self = function() {
  return this.host('self')
         .get({}, {'Authorization':localStorage.getItem('authorization')})
};


// Prepare sightglass to be useful.
sightglass.adapters = rivets.adapters;
sightglass.root = '.';

rivets.binders.mailto = function (el, value) {
  el.setAttribute('href', 'mailto://' + value);
}


function createComponent(name, controllerPrototype) {
  var i, template;
  function ComponentController(data) {
    // Copy data into controller.
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        this[i] = data[i];
      }
    }
  }
  for (i in controllerPrototype) {
    // Copy methods into prototype.
    if (controllerPrototype.hasOwnProperty(i)) {
      ComponentController.prototype[i] = controllerPrototype[i];
    }
  }

  template = document.querySelector("script[type='rivets/component'][name='" + name + "']").textContent;

  rivets.components[name] = {
    template: function () {
      return template;
    },
    initialize: function (el, data) {
      return new ComponentController(data);
    }
  };
}
