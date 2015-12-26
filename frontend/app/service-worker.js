	// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log("SW startup");
var current_cache = 'v1';

self.addEventListener('install', function(event) {

    caches.open(current_cache).then(function(cache) {
      return cache.addAll([
        '/',
        '/styles.css',
        '/server.js',
        '/module.js',
        '/client.js',
        '/common.js',
        '/favicon.png',

        '/api/members'
      ]);
    })
});

self.addEventListener('activate', function(event) {
  console.log("SW activated");
});

self.addEventListener('fetch', function(event) {

	event.respondWith(
		caches
			.open(current_cache)
			.then(function (cache) {
				return cache.match(event.request)
					.then(function (response) {
			    		if (response) {
			    			console.log("Returned from cache", event.request.url);
					      	return response;
			    		} else {
			    			console.log("Fetching", event.request.url);


				          	// We call .clone() on the request since we might use it in the call to cache.put() later on.
				          	// Both fetch() and cache.put() "consume" the request, so we need to make a copy.
				          	// (see https://fetch.spec.whatwg.org/#dom-request-clone)
				          	return fetch(event.request.clone())
				          		.then(function(response) {
	          			            console.log('  Response for %s from network is: %O', event.request.url, response);

						            if (response.status < 400) {
						              	// This avoids caching responses that we know are errors (i.e. HTTP status code of 4xx or 5xx).
						              	// One limitation is that, for non-CORS requests, we get back a filtered opaque response
						              	// (https://fetch.spec.whatwg.org/#concept-filtered-response-opaque) which will always have a
						              	// .status of 0, regardless of whether the underlying HTTP call was successful. Since we're
						              	// blindly caching those opaque responses, we run the risk of caching a transient error response.
						              	//
						              	// We need to call .clone() on the response object to save a copy of it to the cache.
						              	// (https://fetch.spec.whatwg.org/#dom-request-clone)
						              	cache.put(event.request, response.clone());
						            }

						            // Return the original response object, which will be used to fulfill the resource request.
						            return response;
				          		});
				          		
			    			
			    		}
					}).catch(function(error) {
						// This catch() will handle exceptions that arise from the match() or fetch() operations.
						// Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
						// It will return a normal response object that has the appropriate error code set.
						console.error('  Read-through caching failed:', error);

						throw error;
					});
	

			})
  	);
});