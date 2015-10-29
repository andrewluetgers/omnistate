// for webpack to compile css
require('../styles.js').webpackStylesBootstrap();

var React = 		require('react'),
	Router = 		require('react-router'),
	appRoutes =     require('../routes'),
	operations =	require('./operations/operations'),
	omni = 	        require('./common/omni/omni'),
	state =         require('./state/state'),
	Routes =        require('./view/Routes/Routes.jsx');

// init our immutable app state with initial state embedded
// in initial page load exposed via global
var appState = state.init(window.initialAppState);

var render = omni.init({
	containerId:    "app",
	exposeStateOn:  window,     // currentState will be exposed to this object
	appState:       appState,   // the immstruct state object
	appRoutes:      appRoutes,  // see the routes.js module
	operations:     operations  // see the operations.js module
});

// initial app render / init router
// note: this app is not using top-down rendering on every state change
// for details see: https://github.com/omniscientjs/omniscient/issues/93#issuecomment-84812169

Router.run(Routes, Router.HistoryLocation, render);