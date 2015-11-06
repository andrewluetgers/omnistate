
// based on https://github.com/winkler1/icedam
//var makeFreezer,
//    NODE_ENV = process.env.NODE_ENV;
//
//if (NODE_ENV == 'development' || NODE_ENV == 'dev') {
//	var _ = require('lodash'),
//	    clone = obj => JSON.parse(JSON.stringify(obj));
//
//	function deepFreeze(obj) {
//		Object.keys(obj).forEach(function (name) {
//			const prop = obj[name];
//			if (prop !== null && typeof prop === 'object' && !Object.isFrozen(prop)) {
//				deepFreeze(prop);
//			}
//		});
//		Object.freeze(obj);
//	}
//
//
//	// Make a freezer function that will cache its last results.
//	makeFreezer = function (name = '') {
//		var lastInput,
//		    lastOutput,
//		    totalSerializeTime = 0;
//
//		return function (obj) {
//			if (_.isEqual(lastInput, obj)) {
//				console.log(`+1 cached ${name}`);
//				return lastOutput;
//			}
//
//			// Clone and deep freeze the object.
//			const startTime = new Date();
//			lastInput = obj;
//			lastOutput = clone(obj);
//			deepFreeze(lastOutput);
//			const elapsed = new Date().getTime() - startTime.getTime();
//			totalSerializeTime += elapsed;
//			console.log(`FREEZE ${name}: freezing took ${elapsed} TOTAL: ${totalSerializeTime}`);
//
//			return lastOutput;
//		};
//	};
//} else { // NOT DEV
//	makeFreezer = () => {return v => v};
//}



var _ = require('lodash'),
    diff = require('../diff/diff');


function clone(obj) {
	return typeof obj == "object" ? JSON.parse(JSON.stringify(obj)) : obj;
}


module.exports = function() {

	var cb = () => console.log(arguments),
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
		console.time("setState");
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
			console.timeEnd("setState");
			cb && cb(readReplica, _diff);

		} else {
			console.timeEnd("setState");
			console.log("no change", protectedState, val);
		}


	}


	function updateState(path, fn) {
		setState(path, fn(getState(path)));
	}


	function setCb(fn) {cb = fn;}


	return {
		init: init,
		get: getState,
		set: setState,
		update: updateState,
		setCb: setCb,
		replica: readReplica
	};
};
