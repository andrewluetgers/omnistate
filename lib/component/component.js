var React = require('react'),
	proxyMixins = require('../proxyMixins/proxyMixins'),
	_mixins = {},
    debug;


var component = function(displayName, mixins, render) {
	var o = createDefaultArguments(displayName, mixins, render);

	//console.log("CREATE", "<"+displayName+">", mixins);

	return React.createClass({
		displayName: displayName,
		mixins: o.mixins,
		render: o.render
	});
};

component.configure = function(stateContainer, subscribe, _debug) {
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
