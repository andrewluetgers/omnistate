
var React = 		    require('react'),
    Router = 		    require('react-router'),

    _ =                 require('lodash'),
    diff = 		    	require('../diff/diff'),
    ops =		    	require('../ops/ops'),
    component = 	    require('../component/component'),
    stateContainer =    require('../stateContainer/stateContainer');

function resonate(config) {

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
			config.render();
		}
	};


	return state;
}


module.exports = {
	init: resonate,
	component: component
};