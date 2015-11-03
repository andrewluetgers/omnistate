
var React = require('react'),
	Router = require('react-router'),
	mixins = require('../componentMixins/componentMixins'),
	_mixins = {};


//component.debug();

// touch support
React.initializeTouchEvents(true);

// use this one for default omniscient behavior
//module.exports = component;

// use this one for custom behavior,
// see https://github.com/omniscientjs/omniscient/issues/93#issuecomment-84036856
var _component = function(displayName, mixins, render) {
	var o = createDefaultArguments(displayName, mixins, render);
	return React.createClass({
		displayName: displayName,
		mixins: o.mixins,
		render: o.render
	});
};

_component.configure = function(stateGetter, subscribe) {
	//console.log("config", arguments);
	_mixins = mixins.forceUpdateWithSubscription(stateGetter, subscribe);
};

module.exports = _component;

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
	mixins.unshift(Router.Navigation);

	return {
		displayName: displayName,
		mixins: mixins,
		render: render
	};
}