var _ =                 require('lodash'),
	ops =		    	require('./ops/ops'),
    pathEvents =        require('./pathEvents/pathEvents'),
    stateContainer =    require('./stateContainer/stateContainer'),
    component = 	    require('./component/component'),
    ctrl = 	            require('./controller/controller'),
	controller =        ctrl.controller,
    computed =          ctrl.computed;


var appState = {},
    tdCalls = 0,
    RAFBatching = false;


module.exports = {

	init: function(operations, topDownRender, initialState, debug, pushState, useRAFBatching) {

		// ============= component and ops respond to state changes =============

		var container = stateContainer(debug),
			opsNameSpace = "runOps",
			componentNameSpace = "updateComponentes",
			controllerNameSpace = "executeControllers";

		RAFBatching = useRAFBatching;

		_.assign(appState, container);

		// config components to access the state container
		// don't load any components before this point!!
		component.configure(container, pathEvents.subscriber(componentNameSpace), debug);

		// do the same for controllers
		controller.configure(container, pathEvents.subscriber(controllerNameSpace), debug);

		// init our app state with the stateContainer and initial values
		container.init(initialState);

		// get it talking to whatever god-awful routing system is in use
		console.log("init state container", pushState);
		pushState && container.setPushState(pushState);

		// run operations on state change
		container.setOnChangeCallback(function(readReplica, diff) {
			// run operations first
			debug && console.time(opsNameSpace);
			ops(operations, readReplica, diff, opsNameSpace);
			debug && console.time(opsNameSpace);

			debug && console.time(controllerNameSpace);
			pathEvents.callMatching(readReplica, diff, controllerNameSpace);
			debug && console.timeEnd(controllerNameSpace);

			// run a top down render if the route has changed
			if (diff.route && tdCalls > 0) {
				debug && console.time('topDownRender');
				tdCalls++;
				topDownRender();
				debug && console.time('topDownRender');
			}

			if (!RAFBatching) {
				debug && console.time(componentNameSpace);
				pathEvents.callMatching(readReplica, diff, componentNameSpace);
				debug && console.timeEnd(componentNameSpace);
			}
		});

		// force render of individual components if they are subscribed to a state path found in batchedDiff
		if (RAFBatching) {
			container.setRAFBatchedOnChangeCallback(function(readReplica, batchedDiff) {
				debug && console.time(componentNameSpace);
				pathEvents.callMatching(readReplica, batchedDiff, componentNameSpace);
				debug && console.timeEnd(componentNameSpace);
			});
		}
	},

	state: appState,
	component: component,
	controller: controller,
	computed: computed
};


