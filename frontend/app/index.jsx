import _ from 'lodash'

import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react/lib/update'
import { Provider } from 'react-redux'

import { Router } from 'react-router'
import injectTapEventPlugin from "react-tap-event-plugin";

import routes from 'routes'
import {history, configureStore} from 'configureStore'
import DevTools from 'components/devTools'

// Reference static files so they are loaded with webpack.
import 'app.less';
import 'material';
import 'material.css';
import 'favicon.png';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const store = configureStore()


ReactDOM.render(

	<Provider store={store}>
		<div>
		<Router history={history}>
			{ routes(store) }
		</Router>
	    <DevTools />
		</div>
	</Provider>,
	document.getElementById('app')
);