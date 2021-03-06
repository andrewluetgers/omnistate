
import omni from 'omnistate'
import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute} from 'react-router'

// take a look at the omniStateReactRouter to see
// how CaptureRouterState teaches ReactRouter to talk to OmniState and
// how pushState teaches OmniState to talk to ReactRouter
import {CaptureRouteState, pushState, history} from 'omnistate/lib/reactRouterIntegration'


/* ============== OmniState init =============== */
window.omni = omni; // exposed for easy debugging

// init OmniState
omni.init({perf: true, debug: true});

// initial app state can now be set
// a nice way to do this is to partition app state into
// separate files per concern, each living under some state property
// for example this state is all under 'todos'
require('./state/state').init();
require('./state/todos/todos').init();

// load/init controllers
// controllers respond to state changes
// for example this one saves the app state to localstorage
// when it any state changes and loads it upon initialization.
var storage = require('./controller/storage');
omni.state.setPushState(pushState);
storage.load();

// !!!!! IMPORTANT! DO NOT LOAD ANY OMNISTATE UI COMPONENTS BEFORE THIS POINT !!!!!
//         DO NOT UES ES6 IMPORT FOR OMNISTATE UI COMPONENTS IN THIS FILE!

// why? OmniState init must run before modules using omnistate.component are loaded
// es6 imports are  hoisted to the top breaking this requirement


/* ============== ReactRouter integration ============== */
// !! remember, do not use import on OmniState view components in this file!!
var TodoApp = require('./view/TodoApp/TodoApp.jsx');

render((
	<Router history={history}>
		<Route path="/" component={CaptureRouteState}>
			<IndexRoute component={TodoApp}/>
			<Route path={"/active"} component={TodoApp}/>
			<Route path={"/completed"} component={TodoApp}/>
		</Route>
	</Router>
), document.getElementById('root'));

