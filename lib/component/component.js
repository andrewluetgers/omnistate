var React = require('react'),
	proxyMixins = require('../proxyMixins/proxyMixins'),
	_mixins = {},
	componentCalled = false,
    debug;


var component = function(displayName, mixins, render) {
	componentCalled = true;
	var o = createDefaultArguments(displayName, mixins, render);

	debug && console.log("CREATE", "<"+displayName+">", o);

	return React.createClass({
		displayName: displayName,
		mixins: o.mixins,
		render: o.render
	});
};

component.configure = function(stateContainer, subscribe, _debug) {
	if (componentCalled) {
		throw new Error("OmniState Compoinent loaded before omnistate.init and or "
						+ "omnistate.component.configure executed. Be sure to call omnistate.init before "
						+ "loading any OmniState view component modules. BEWARE ES6 import will hoist "
						+ "modules breaking this requirement so use require instead of import for "
						+ "OmniState view components. This need only apply to the main app file where "
						+ "omni.init is called.");
	}
	debug = _debug;
	_mixins = proxyMixins(stateContainer, subscribe, debug);
};

function createDefaultArguments(displayName, mixins, render) {
	// (render)
	if (typeof displayName === 'function') {
		render      = displayName;
		mixins      = [];
		displayName = void 0;
	}

	// (mixins, render)
	if (typeof displayName === 'object' && typeof mixins === 'function') {
		render      = mixins;
		mixins      = displayName;
		displayName = void 0;
	}

	// (displayName, render)
	if (typeof displayName === 'string' && typeof mixins === 'function') {
		render = mixins;
		mixins = [];
	}

	// Else (displayName, mixins, render)
	if (!Array.isArray(mixins)) {
		mixins = [mixins];
	}

	mixins.unshift(_mixins);

	return {
		displayName: displayName,
		mixins: mixins,
		render: !debug ? render : function _render() {
			console.debug("<"+displayName+"> RENDERED");
			return render.call(this, this.props);
		}
	};
}

module.exports = component;
