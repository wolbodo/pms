import Immutable from 'immutable';
import _ from 'lodash';

import thunkMiddleware from 'redux-thunk';
import { compose, createStore, applyMiddleware } from 'redux';

import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';

import persistState from 'redux-localstorage';
import diffLogger from 'redux-diff-logger';
import perfLogger from 'redux-perf-middleware';

import apiMiddleware from './apiMiddleware';

function createAppReducers() {
  // Wrap in function for HMR reducer reloading
  return require('redux/modules/reducers').default;
}

const appReducer = createAppReducers();

const finalCreateStore = compose(
  persistState(null, {
    serialize: (state) => JSON.stringify(state.toJS()),
    deserialize: (string) => Immutable.fromJS(JSON.parse(string)),
    merge: (initial, newstate) => (initial || Immutable.Map()).merge(newstate)
  }),
  // Middleware you want to use in development:
  applyMiddleware(
    apiMiddleware,
    thunkMiddleware,
    routerMiddleware(browserHistory),
    // Wrap loggers in unpacking wrapper (to unpack ImmutableJS objects)
    // Unwrap action
    () => (next) => (action) =>
      next(_.merge({ type: action.name || action.type }, action)),
    perfLogger,
    // Wrap store to change getState to unwrap :)
    (store) => diffLogger({
      getState: () => store.getState().toJS()
    })
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  window.devToolsExtension ? window.devToolsExtension() : (state) => state

)(createStore);

export default function configureStore() {
  const store = finalCreateStore(appReducer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('redux/modules/reducers', () =>
      store.replaceReducer(createAppReducers())
    );
  }

  return { store, history: browserHistory };
}

