import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { Router } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';

import routes from 'routes';
import configureStore from 'redux/configureStore';

// Reference static files so they are loaded with webpack.;
import 'file?name=[name].[ext]!../index.html';
import 'material.css';
import 'app.less';
import 'material';
import 'favicon.png';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const { store, history } = configureStore();


ReactDOM.render((
	<Provider store={store}>
		<div>
		<Router history={history}>
			{ routes(store) }
		</Router>
		</div>
	</Provider>
	),
	document.getElementById('app')
);
