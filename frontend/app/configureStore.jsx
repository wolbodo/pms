import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { syncHistory, routeReducer } from 'redux-simple-router'
import { createHistory } from 'history'

import DevTools from './components/devTools';
import reducers from './reducers'

export const history = createHistory();
const historyMiddleware = syncHistory(history);

const rootReducer = combineReducers(
  Object.assign(reducers, {
    routing: routeReducer
  })
);

const finalCreateStore = compose(
  // Middleware you want to use in development:
  applyMiddleware(
    historyMiddleware,
    thunkMiddleware,
    createLogger()
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
)(createStore);


export function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, initialState);

  // historyMiddleware.listenForReplays(store);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  // if (module.hot) {
  //   module.hot.accept('reducers', () =>
  //     store.replaceReducer(require('reducers')/*.default if you use Babel 6+ */)
  //   );
  // }

  return store;
}

