
var React = require('react'),
	Router = require('react-router'),
	mixins = require('../forceUpdateWithSubscription/forceUpdateWithSubscription'),
	_mixins = {};


// touch support
React.initializeTouchEvents(true);

var component = function(displayName, mixins, render) {
	var o = createDefaultArguments(displayName, mixins, render);
	return React.createClass({
		displayName: displayName,
		mixins: o.mixins,
		render: o.render
	});
};

component.configure = function(stateContainer, subscribe) {
	//console.log("config", arguments);
	_mixins = mixins.forceUpdateWithSubscription(stateContainer, subscribe);
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
	mixins.unshift(Router.Navigation);

	return {
		displayName: displayName,
		mixins: mixins,
		render: render
	};
}

module.exports = component;
