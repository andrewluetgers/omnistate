
var React = 		    require('react'),
    Router = 		    require('react-router'),
    _ =                 require('lodash'),
    ops =		    	require('../ops/ops'),
    component = 	    require('../component/component'),
    stateContainer =    require('../stateContainer/stateContainer'),
    appState =          require('../../state/state');


module.exports = {

	init: function(_operations, topDownRender, initialState, debug) {

		// ========================== operations ==========================

		var operations = _.cloneDeep(_operations);

		// this should remain the second to last operation
		// forces render of any components with proxies that changed
		operations.__callMatching__ = debug ? ops.debugCallMatching : ops.callMatching;

		// this should remain the final operation
		// calls the top-down render
		operations.__renderRoute__ = {
			require: ['route.pathname'],
			changes: ['route.pathname'],
			operation: function (n, c) {
				//console.log("render route", n);
				render();
			}
		};


		// ============= component and ops respond to state changes =============

		var sc = stateContainer(debug),
			eventNameSpace = "stateChange";

		// init our app state with the stateContainer and initial values
		appState.init(sc, initialState);

		// config components to access the serializedState
		// don't load any components before this point!!
		component.configure(sc, ops.eventSubscriber(eventNameSpace), debug);

		// run operations on state change
		sc.setCb(function(readReplica, diff) {
			//console.log("change callback", arguments);
			ops.run(operations, readReplica, diff, eventNameSpace, debug);
		});
	},

	state: appState,
	component: component
};