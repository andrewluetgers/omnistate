
import omni from 'omnistate'
import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute} from 'react-router'
import {CaptureRouteState, pushState, history} from 'omnistate/lib/reactRouterIntegration'
import appState from './state/alpha/alpha'
import controllerExample from './controllers/example'

window.state = omni.state;
omni.init({RAFBatching: false});
appState.init();
controllerExample.init();

render((
	<Router history={history}>
		<Route path="/" component={CaptureRouteState}>
			<IndexRoute component={require('./view/Base/Base.jsx')}/>
		</Route>
	</Router>
), document.getElementById('root'));