import Immutable from 'immutable'

import { routeReducer, syncHistory } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { combineReducers as combineImmutableReducers } from 'redux-immutable';
import persistState from 'redux-localstorage';

import { createHistory } from 'history'

// Immutable reducers
import loggerMiddleware from './middleware/logger'
import * as appReducers from './reducers';

export const history = createHistory();
const historyMiddleware = syncHistory(history);



// Combine the appReducers into one appReducer.
const appReducer = combineImmutableReducers(appReducers);

// setup the app state. (Immutable)
const initialAppState = appReducer(Immutable.Map(), {name: 'CONSTRUCT'})
const initialState = {app: initialAppState}


const finalCreateStore = compose(
  // persistState(),
  // Middleware you want to use in development:
  applyMiddleware(
    historyMiddleware,
    thunkMiddleware,
    loggerMiddleware
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : f => f
  
)(createStore);




export function configureStore(initialState = initialState) {
  const store = finalCreateStore(
                  combineReducers({
                    routing: routeReducer,
                    app: appReducer
                  })
              , initialState);

  historyMiddleware.listenForReplays(store);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('reducers', () =>
      store.replaceReducer(require('reducers')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}

