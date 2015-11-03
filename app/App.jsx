// for webpack to compile css
require('../styles.js').webpackStylesBootstrap();

var React = 		require('react'),
	appRoutes =     require('../routes'),
	omni = 	        require('./common/omni/omni'),
	operations =	require('./operations/operations'),
	state =         require('./state/state');

// init the app, configures routing, state, component, operations
var app = omni.init({
	containerId:    "app",
	appRoutes:      appRoutes,  // see the routes.js module
	operations:     operations  // see the operations.js module
});

// the state module needs to be initialized to use the app state container
// also provide any initial state here that came from page-load to get mixed in
state.init(app.state, window.initialAppState);

// expose our state read-replica globally for easy debugging
window.currentState = app.state.replica;


// ============ !! don't load any routes or view components before this point !! ===============

var Routes = require('./view/Routes/Routes.jsx');
app.initRouter(Routes);


window.stats = new Stats();
// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );