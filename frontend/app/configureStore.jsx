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

export const history = createHistory();
const historyMiddleware = syncHistory(history);


function createAppReducers() {
  // import * as appReducers from './reducers';
  let appReducers = require('reducers')
  
  // Combine the appReducers into one appReducer.
  const appReducer = combineImmutableReducers(appReducers);

  // Wrap rootreducer to delete entire state when logging out
  return (reducers => (state, action) => 
      ((action.type || action.name) === 'AUTH_LOGOUT_REQUEST')
      ? reducers({}, {name: "CONSTRUCT"})
      : reducers(state, action)
    )(combineReducers({routing: routeReducer, app: appReducer}))
}

let appReducer = createAppReducers();
let initialState = appReducer({}, {name: "CONSTRUCT"})


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
    }) 
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : f => f
  
)(createStore);



export function configureStore(initialState = initialState) {

  const store = finalCreateStore(appReducer, initialState);

  historyMiddleware.listenForReplays(store);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(createAppReducers())
    );
  }

  return store;
}

