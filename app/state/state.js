
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


function init(stateContainer, mixin) {
	console.log("INIT STATE", arguments);
	var base = _.cloneDeep(base);
	base = _.assign(base, mixin);

	base && stateContainer.init(base);
	appState = stateContainer;
	// call other state inits here
	alpha.init();
}

function getter(p) {
	return appState.update(p);
}
function setter(p, v) {
	return appState.set(p, v);
}

function update(p, f) {
	//console.log("UPDATE", p, f);
	return appState.update(p, f);
}

function replica() {
	return appState.replica;
}


// proxy the state container provided via init
module.exports = {
	init: init,
	get: getter,
	set: setter,
	update: update,
	replica: replica
};
