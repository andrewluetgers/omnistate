
var React = 		require('react'),
	immutable = 	require('immutable'), 
    _ =             require('lodash'),
	diff = 			require('../diff/diff'),
	ops =			require('../ops/ops'),
	component = 	require('../component/component');


module.exports = {

	init: function(config) {
		var operations = _.cloneDeep(config.operations);

		// this should remain the second to last operation
		operations.__callMatching__ = ops.callMatching;

		// this should remain the final operation
		operations.__renderRoute__ = {
			require: ['route.pathname'],
			changes: ['route.pathname'],
			operation: function (n) {n.route.render();}
		};

		var _n, _o, _p=[],
		    root = config.exposeStateOn || {},
		    eventNameSpace = "stateChange";

	    function swapHandler() {
		    console.time("change observation");
		    var _diff = {};

		    if (!root.currentState) {
			    var priorState = _o && _o.toJS();
			    root.currentState = _n.toJS();
			    _diff = diff(priorState, root.currentState);
		    } else {
			    _p.map(p => {
				    var newVal = _n.getIn(p),
				        oldVal = _.get(root.currentState, p);

				    if (typeof newVal == 'object' && 'toJS' in newVal) {
					    newVal = newVal.toJS();
				    }

				    var pdif = (typeof oldVal == "object" && typeof newVal == "object") ? diff(oldVal, newVal) : newVal;
				    _.set(_diff, p, pdif);
				    _.set(root.currentState, p, newVal);
			    });
		    }

		    _o = null;
		    _p = [];
		    console.timeEnd("change observation");

		    ops.run(operations, root.currentState, _diff, eventNameSpace);
	    }

		var now = new Date().getTime(),
		    no = 0;

		config.appState.on('swap', function(n, o, path) {
			console.log(!_o ? "set old and new" : "set new only" + (no++), new Date().getTime() - now);
			_p.push(path);
			_o = _o || o; // don't loose the oldest sate if debouncing
			_n = n; // always use newest new val
			swapHandler();
		});

		// config components to access the serializedState
		// don't load any components before this point!!
		function getSerializedState() {return root.currentState}
		component.configure(getSerializedState, ops.eventSubscriber(eventNameSpace));

		var Handler, routerState;

		function render(h, s) {
			if (h) Handler = h;
			if (s) {
				routerState = s;
				config.appState.cursor().update('route', function(v) {
					// routerState.render will be the last thing called from the route operation
					// this way render is not called before operations are run
					var appRoute = config.appRoutes.match(routerState.pathname) || {};
					//console.log("SET APP ROUTE", routerState.pathname, appRoute);
					routerState.name = appRoute.name;
					routerState.action = appRoute.action;
					routerState.actionPath = appRoute.actionPath;
					routerState.render = function() {
						React.render(<Handler route={routerState} deviceType="desktop" environment="browser"/>, document.getElementById(config.containerId));
					};
					return immutable.fromJS(routerState);
				});
			}
		}
		
		return render;
	}
};