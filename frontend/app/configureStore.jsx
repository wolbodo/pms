import Immutable from 'immutable'
import _ from 'lodash';

// import { routeReducer, syncHistory } from 'react-router-redux'

import thunkMiddleware from 'redux-thunk'
import { compose, createStore, applyMiddleware } from 'redux'
import {combineReducers } from 'redux-immutable'

import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

// import persistState from 'redux-localstorage'
import diffLogger from 'redux-diff-logger'
import perfLogger from 'redux-perf-middleware'

// Immutable reducers
// import combineImmutableReducers from './combineImmutableReducers';


function createAppReducers() {
  // import * as appReducers from './reducers';
  let appReducers = require('reducers')

  return combineReducers(appReducers);
  
  // Combine the appReducers into one appReducer.
  // const appReducer = combineImmutableReducers(appReducers);

  // // Wrap rootreducer to delete entire state when logging out
  // return (reducers => (state, action) => 
  //     ((action.type || action.name) === 'AUTH_LOGOUT_REQUEST')
  //     ? reducers({}, {name: 'CONSTRUCT'})
  //     : reducers(state, action)
  //   )(combineReducers({routing: routeReducer, app: appReducer}))
}

let appReducer = createAppReducers();
let initialState = Immutable.Map();


const finalCreateStore = compose(
  // persistState(['app'], {
  //   serialize: collection => 
  //     JSON.stringify(collection.app.toJSON()),
  //   deserialize: collectionJSON => 
  //     collectionJSON ? {
  //       app: Immutable.fromJS(JSON.parse(collectionJSON))
  //     } : initialState
  // }),
  // Middleware you want to use in development:
  applyMiddleware(
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



export default function configureStore(_initialState) {

  _initialState = _initialState || initialState;

  // var initstate = appReducer(_initialState);

  const store = createStore(appReducer, _initialState);

  const history = syncHistoryWithStore(browserHistory, store, {
    selectLocationState: state => state.get('routing')
  });

  // historyMiddleware.listenForReplays(store, (state) => {
  //   return state.getIn(['routing', 'locationBeforeTransitions'])
  // });

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(createAppReducers())
    );
  }

  return {store, history};
}

