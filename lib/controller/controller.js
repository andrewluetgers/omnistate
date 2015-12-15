var proxyMixins = require('../proxyMixins/proxyMixins'),
	_ = require('lodash');


var _mixins = {},
	stateContainer,
	debug;


function controller(displayName, mixins) {

	if (!mixins) {
		mixins = displayName;
		displayName = mixins.displayName;
	}


	if (!displayName) {
		throw new Error("displayName not set");
	}

	if (!mixins.exec && !mixins.onStateChange) {
		throw new Error("Either and 'exec' or 'onStateChange' function is required but neither set.");
	}

	var _exec = mixins.exec;

	function exec() {
		ctrl.update();
		_exec.call(ctrl);
	}

	var ctrl = _.assign({}, mixins, {
		displayName: displayName,
		init: _mixins.componentWillMount,
		update: _mixins.componentWillUpdate,
		remove: _mixins.componentWillUnmount,
		_updateMethod: "exec",
		exec: function noOp() {}
	});

	if (_exec) {
		ctrl.exec = !debug ? exec : function __exec() {
			console.debug("["+displayName+" Controller] Executed");
			exec();
		}
	}

	//console.log("controller init", displayName, mixins, _exec, ctrl);
	ctrl.init();
	return ctrl;
}


controller.configure = function(_stateContainer, subscribe, _debug) {
	debug = _debug;
	stateContainer = _stateContainer;
	_mixins = proxyMixins(_stateContainer, subscribe, debug);
};


function computed(vals) {
	return _.map(vals, function(spec, path) {
		var proxies = {},
			args = spec[0],
			fn = spec[1];

		_.each(args, function(arg) {
			proxies[arg] = arg;
		});

		// callback executed with controller as 'this'
		return controller({
			displayName: 'compute: ' + path,
			proxies: proxies,
			exec: function computeVal() {
				var self = this,
				    vals = _.map(proxies, function(p) {
					    return self[p]
				    }),
				    val = fn.apply(this, vals);

				stateContainer.set(path, val);
			}
		});
	});
}


module.exports = {
	controller: controller,
	computed: computed
};
