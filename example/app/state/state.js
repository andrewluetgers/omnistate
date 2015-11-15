
var _ = require('lodash');


// this is a stateful module!!
var sc;

function init(_stateContainer, mixin) {
	console.log("INIT STATE", arguments);
	var base = {};
	_.assign(base, mixin);
	_stateContainer.init(base);
	sc = _stateContainer;
}

function getter(p) {
	return sc.get(p);
}
function setter(p, v) {
	return sc.set(p, v);
}

function update(p, f) {
	return sc.update(p, f);
}

function replica() {
	return sc.replica;
}

// proxy the state container provided via init
module.exports = {
	init: init,
	get: getter,
	set: setter,
	update: update,
	replica: replica
};
