import Immutable from 'immutable'
import _ from 'lodash';

// import { routeReducer, syncHistory } from 'react-router-redux'

import thunkMiddleware from 'redux-thunk'
import { compose, createStore, applyMiddleware } from 'redux'
import {combineReducers } from 'redux-immutable'

import { browserHistory } from 'react-router'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'

import persistState from 'redux-localstorage'
import diffLogger from 'redux-diff-logger'
import perfLogger from 'redux-perf-middleware'



function createAppReducers() {
  // import * as appReducers from './reducers';
  let appReducers = require('reducers')

  return combineReducers(appReducers);
}

let appReducer = createAppReducers();

const finalCreateStore = compose(
  persistState(null, {
    serialize: state => JSON.stringify(state.toJS()),
    deserialize: string => Immutable.fromJS(JSON.parse(string)),
    merge: (initial, newstate) => (initial || Immutable.Map()).merge(newstate)
  }),
  // Middleware you want to use in development:
  applyMiddleware(
    thunkMiddleware,
    routerMiddleware(browserHistory),
    // Wrap loggers in unpacking wrapper (to unpack ImmutableJS objects)
    // Unwrap action
    store => next => action => 
      next(_.merge({type: action.name || action.type}, action)),
    perfLogger,
    // Wrap store to change getState to unwrap :)
    store => diffLogger({
      getState: getState => store.getState().toJS()
    }) 
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : f => f
  
)(createStore);



export default function configureStore() {

  const store = finalCreateStore(appReducer);

  // const history = syncHistoryWithStore(browserHistory, store, {
  //   selectLocationState: state => state.get('routing')
  // });

  // historyMiddleware.listenForReplays(store, (state) => {
  //   return state.getIn(['routing', 'locationBeforeTransitions'])
  // });

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(createAppReducers())
    );
  }

  return {store, history: browserHistory};
}

