import Immutable from 'immutable'
import _ from 'lodash';

import { routeReducer, syncHistory } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'

import persistState from 'redux-localstorage'
import diffLogger from 'redux-diff-logger'
import perfLogger from 'redux-perf-middleware'

import { createHistory } from 'history'

// Immutable reducers
import combineImmutableReducers from './combineImmutableReducers';
import * as appReducers from './reducers';

export const history = createHistory();
const historyMiddleware = syncHistory(history);

// Combine the appReducers into one appReducer.
const appReducer = combineImmutableReducers(appReducers);

// Wrap rootreducer to delete entire state when logging out
let rootReducer = (reducers => (state, action) => 
    ((action.type || action.name) === 'AUTH_LOGOUT_REQUEST')
    ? reducers({}, {name: "CONSTRUCT"})
    : reducers(state, action)
  )(combineReducers({routing: routeReducer, app: appReducer}))

let initialState = rootReducer({}, {name: "CONSTRUCT"})


const finalCreateStore = compose(
  persistState(['app'], {
    serialize: collection => 
      JSON.stringify(collection.app.toJSON()),
    deserialize: collectionJSON => 
      collectionJSON ? {
        app: Immutable.fromJS(JSON.parse(collectionJSON))
      } : initialState
  }),
  // Middleware you want to use in development:
  applyMiddleware(
    historyMiddleware,
    thunkMiddleware,
    // Wrap loggers in unpacking wrapper (to unpack ImmutableJS objects)
    // Unwrap action
    store => next => action => 
      next(_.merge({type: action.name || action.type}, action)),
    perfLogger,
    // Wrap store to change getState to unwrap :)
    store => diffLogger({
      getState: getState => store.getState().app.toJS()
    }) ,
    // Unwrap action
    store => next => action => 
      // return type only if name si not defined. (for immutable actions :S)
      next(_.pick(action, (value, key) => 
        !((key === 'type') && _.has(action, 'name'))
      )),
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : f => f
  
)(createStore);



export function configureStore(initialState = initialState) {

  const store = finalCreateStore(rootReducer, initialState);

  historyMiddleware.listenForReplays(store);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(require('reducers')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}

