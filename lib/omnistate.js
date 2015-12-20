var _ =					require('lodash'),
	pathEvents =		require('./pathEvents/pathEvents'),
	stateContainer =	require('./stateContainer/stateContainer'),
	component = 		require('./component/component'),
	ctrl = 				require('./controller/controller'),
	controller =		ctrl.controller,
	computed =			ctrl.computed;

var appState = {};

module.exports = {

	init: function(opts) {
		opts = opts || {};

		var RAFBatching = 'RAFBatching' in opts ? opts.RAFBatching: true,
			perf = opts.perf,
			debug = opts.debug,
			container = stateContainer(debug),
			componentNameSpace = "updateComponentes",
			controllerNameSpace = "executeControllers",
			callMatching = pathEvents.callMatching;

		_.assign(appState, container);

		// config components to access the state container
		// don't load any components before this point!!
		component.configure(container, pathEvents.subscriber(componentNameSpace), debug);

		// do the same for controllers
		controller.configure(container, pathEvents.subscriber(controllerNameSpace), debug);

		// init our app state initially empty
		container.init();

		// some repetition here but wanted to eliminate all conditionals
		// in non dev mode because the nChangeCallback is a hot function
		if (debug || perf) {
			container.setOnChangeCallback(function(readReplica, diff) {
				
				// run controllers first
				perf && console.time(controllerNameSpace);
				callMatching(readReplica, diff, controllerNameSpace);
				perf && console.timeEnd(controllerNameSpace);

				if (!RAFBatching) {
					perf && console.time(componentNameSpace);
					callMatching(readReplica, diff, componentNameSpace);
					perf && console.timeEnd(componentNameSpace);
				}
			});

			// force render of individual components if they are subscribed to a state path found in batchedDiff
			if (RAFBatching) {
				container.setRAFBatchedOnChangeCallback(function(readReplica, batchedDiff) {
					perf && console.time(componentNameSpace);
					callMatching(readReplica, batchedDiff, componentNameSpace);
					perf && console.timeEnd(componentNameSpace);
				});
			}
		} else {
			if (RAFBatching) {
				container.setOnChangeCallback(function(readReplica, diff) {
					callMatching(readReplica, diff, controllerNameSpace);
				});

				// force render of individual components if they are subscribed to a state path found in batchedDiff
				container.setRAFBatchedOnChangeCallback(function(readReplica, batchedDiff) {
					callMatching(readReplica, batchedDiff, componentNameSpace);
				});
			} else {
				container.setOnChangeCallback(function(readReplica, diff) {
					callMatching(readReplica, diff, controllerNameSpace);
					callMatching(readReplica, diff, componentNameSpace);
				});
			}
		}
	},

	state: appState,
	component: component,
	controller: controller,
	computed: computed
};


