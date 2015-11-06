
var React = 		    require('react'),
    Router = 		    require('react-router'),
	_ =                 require('lodash'),
	diff = 		    	require('../diff/diff'),
	ops =		    	require('../ops/ops'),
	component = 	    require('../component/component'),
	stateContainer =    require('../stateContainer/stateContainer');


module.exports = {

	init: function(config) {

		// ========================== router ==========================

		var Handler, routerState;

		function routeHandler(h, s) {
			if (h) Handler = h;
			if (s) {
				routerState = s;
				// routerState.render will be the last thing called from the route operation
				// this way render is not called before operations are run
				var appRoute = config.appRoutes.match(routerState.pathname) || {};
				//console.log("SET APP ROUTE", routerState.pathname, appRoute);
				routerState.name = appRoute.name;
				routerState.action = appRoute.action;
				routerState.actionPath = appRoute.actionPath;
				state.set('route', routerState);
			}
		}

		function initRouter(Routes) {
			// initial app render / init router
			// note: this app is not using top-down rendering on every state change
			// for details see: https://github.com/omniscientjs/omniscient/issues/93#issuecomment-84812169
			return Router.run(Routes, Router.HistoryLocation, routeHandler);
		}

		function render() {
			React.render(<Handler route={routerState} deviceType="desktop" environment="browser"/>, document.getElementById(config.containerId));
		}


		// ========================== operations ==========================

		var operations = _.cloneDeep(config.operations);

		// this should remain the second to last operation
		// forces render of any components with dataBindings that changed
		operations.__callMatching__ = ops.callMatching;

		// this should remain the final operation
		// calls the top-down render you would normally expect the routeHandler to perform
		operations.__renderRoute__ = {
			require: ['route.pathname'],
			changes: ['route.pathname'],
			operation: function (n, c) {
				console.log("render route", n);
				render();
			}
		};


		// ============= component and ops respond to state changes =============

		var state = stateContainer(),
		    eventNameSpace = "stateChange";

		// config components to access the serializedState
		// don't load any components before this point!!
		function getSerializedState() {return state.replica}
		component.configure(getSerializedState, ops.eventSubscriber(eventNameSpace));

		// run operations on state change
		state.setCb(function(readReplica, diff) {
			ops.run(operations, readReplica, diff, eventNameSpace);
		});

		
		return {
			initRouter: initRouter,
			state: state
		};
	}
};