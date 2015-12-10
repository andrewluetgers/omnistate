var proxyMixins = require('../proxyMixins/proxyMixins'),
    _ = require('lodash');


var _mixins = {},
	stateContainer,
    debug;


function controller(displayName, mixins, _exec) {

	function exec() {
		ctrl.update();
		_exec.call(ctrl);
	}

	var ctrl = {
		displayName: displayName,
		init: _mixins.componentWillMount,
		update: _mixins.componentWillUpdate,
		remove: _mixins.componentWillUnmount,
		_updateMethod: "exec",
		exec: !debug ? exec : function __exec() {
			console.debug("["+displayName+" Controller] Executed");
			exec();
		}
	};

	_.assign(ctrl, mixins);
	console.log("controller init", displayName, mixins, _exec, ctrl);
	ctrl.init();
	return ctrl;
}


controller.configure = function(_stateContainer, subscribe, _debug) {
	debug = _debug;
	stateContainer = _stateContainer;
	_mixins = proxyMixins(_stateContainer, subscribe, debug);
};


function computed(vals) {
	console.log("computed", vals);
	return _.map(vals, function(spec, path) {
		var proxies = {},
		    args = spec[0],
		    fn = spec[1];

		_.each(args, function(arg) {
			proxies[arg] = arg;
		});

		console.log("-----------", args, proxies, fn);

		// callback executed with controller as 'this'
		return controller('compute: ' + path, {proxies: proxies}, function computeVal() {
			console.log("compute val", path, this);
			var self = this,
				vals = _.map(proxies, function(p) {return self[p]}),
			    val = fn.apply(this, vals);

			console.log("VALS", path, vals, val);

			stateContainer.set(path, val);
		});
	});
}


module.exports = {
	controller: controller,
	computed: computed
};
