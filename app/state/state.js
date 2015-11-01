
var _ = 	        require('lodash'),
	immstruct = 	require('immstruct'),
    alpha =         require('./alpha/alpha');

// this is a stateful module!!
var appState;

var base = {
	user: "", // comes from user global on init

	alphTableVisible: true,

	route: { // comes from react-router
		action: "",
		path: "",
		pathname: "",
		params: null,
		query: null
	}
};


module.exports.init = function(mixin) {
	var state = _.cloneDeep(base);
	state = _.assign(state, mixin);

	appState = immstruct('appState', state);
	// call other state inits here
	alpha.init();

	return appState;
};

module.exports.get = function() {
	return appState;
};

module.exports.cursor = function(path) {
	return appState.cursor(path);
};

module.exports.update = function() {
	var cur = appState.cursor();
	return cur.update.apply(cur, arguments);
};

module.exports.updateIn = function() {
	var cur = appState.cursor();
	return cur.updateIn.apply(cur, arguments);
};

module.exports.getIn = function() {
	var cur = appState.cursor();
	return cur.getIn.apply(cur, arguments);
};
