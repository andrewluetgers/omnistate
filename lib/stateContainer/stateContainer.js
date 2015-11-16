"use strict";

var _ = require('lodash'),
    diff = require('../diff/diff');


function clone(obj) {
	return typeof obj == "object" ? JSON.parse(JSON.stringify(obj)) : obj;
}


module.exports = function(debug) {

	console.log("init stateContainer", debug);

	var cb = () => debug && console.log(arguments),
		protectedState = {},
		readReplica = {};


	function init(initialState) {
		_.assign(protectedState, clone(initialState));
		_.assign(readReplica, clone(initialState));
	}

	function getState(path) {
		return clone(_.get(protectedState, path));
	}

	function setState(path, val) {
		debug && console.time("setState");
	    var _diff = {},
		    pdif,
			replica,
		    newVal,
			oldVal = _.get(protectedState, path),
		    nIsObj = val && typeof val == 'object',
		    oIsObj = oldVal && typeof oldVal == 'object',
		    oldValV = oIsObj && JSON.stringify(oldVal) || oldVal,
		    newValV = nIsObj && JSON.stringify(val) || val;

		if (newValV != oldValV) {
			if (nIsObj) {
				newVal = JSON.parse(newValV);
				replica = JSON.parse(newValV);
				pdif = oIsObj ? diff(oldVal, newVal) : newVal;

			} else {
				newVal = newValV;
				replica = newValV;
				pdif = newValV;
			}

			_.set(_diff, path, pdif);
			_.set(protectedState, path, newVal);
			_.set(readReplica, path, replica);

			//console.log("state change", protectedState, readReplica, _diff);
			debug && console.timeEnd("setState");
			cb && cb(readReplica, _diff);

		} else {
			debug && console.timeEnd("setState");
			debug && console.log("no change", protectedState, val);
		}
	}


	function updateState(path, fn) {
		//console.log("update state", path, fn, getState(path));
		setState(path, fn(getState(path)));
	}


	function setCb(fn) {cb = fn;}


	return {
		init: init,
		setCb: setCb,
		get: getState,
		set: setState,
		update: updateState,
		replica: readReplica
	};
};
