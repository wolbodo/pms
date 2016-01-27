import Immutable from 'immutable'

import { routeReducer, syncHistory } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import persistState from 'redux-localstorage';

import { createHistory } from 'history'

// Immutable reducers
import combineImmutableReducers from './combineImmutableReducers';
import * as appReducers from './reducers';

export const history = createHistory();
const historyMiddleware = syncHistory(history);



// Combine the appReducers into one appReducer.
const appReducer = combineImmutableReducers(appReducers);

const finalCreateStore = compose(
  // persistState(),
  // Middleware you want to use in development:
  applyMiddleware(
    historyMiddleware,
    thunkMiddleware,
    createLogger()
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : f => f
  
)(createStore);




export function configureStore(initialState = {}) {
  let rootReducer = combineReducers({
    routing: routeReducer,
    app: appReducer
  })
  const store = finalCreateStore(
                  rootReducer,
                  rootReducer(initialState, {name: "CONSTRUCT"}));

  historyMiddleware.listenForReplays(store);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(require('reducers')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}

