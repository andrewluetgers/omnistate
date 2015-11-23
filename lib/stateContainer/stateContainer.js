
var _ = require('lodash'),
    diff = require('../diff/diff');


function clone(obj) {
	return typeof obj == "object" ? JSON.parse(JSON.stringify(obj)) : obj;
}


module.exports = function(debug) {

	var cb = function() {},
		protectedState = {},
		readReplica = {};


	// todo record inits, use an internal base path
	function init(initialState) {
		_.assign(protectedState, clone(initialState));
		_.assign(readReplica, clone(initialState));
		cb(readReplica, readReplica);
	}

	function getState(path) {
		return clone(_.get(protectedState, path));
	}

	// todo append an internal base path
	function setState(path, val, next, isRerun) {
		if (playing && !isRerun) {return}
		//console.log("set state path", path);
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

		if (recording) {
			currentTs = new Date().getTime();
			log.push({ts: currentTs, path: path, val: clone(val), rollback: clone(oldVal)});
		}

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
			cb(readReplica, _diff);

			debug && console.time("verify");
			debug && verify(true);
			debug && console.timeEnd("verify");

		} else {
			debug && console.timeEnd("setState");
			debug && console.log("no change", protectedState, val);
		}

		next && next();
	}

	function updateState(path, fn) {
		//console.log("update state", path, fn, getState(path));
		setState(path, fn(getState(path)));
	}

	function setCb(fn) {cb = fn;}

	function snapshot() {
		return clone(protectedState);
	}

	function verify(throwError) {
		var p = JSON.stringify(protectedState),
		    r = JSON.stringify(readReplica),
		    same = p === r;

		if (throwError && !same) {
			throw new Error("Something was assigned to the read replica! Use state setters instead.");
		} else {
			return same;
		}
	}


	// history methods ====================================================
	var recording = false,
	    playing = false,
		checkpoints = [],
	    log = [],
	    currentTs = "";


	function loadCheckpoints() {
		try {
			var cp = localStorage.getItem("checkpoints");
			checkpoints = cp ? JSON.parse(cp) : [];
			console.log("LOADED CHECKPOINTS", checkpoints);
		} catch (e) {
			console.log("ERROR - loadCheckpoints", cp);
			console.warn('Could not load from localStorage:', e, cp);
		}
	}

	function saveCheckpoints() {
		try {
			localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
		} catch (e) {
			console.warn('Could not write to localStorage:', e);
		}
	}


	function checkpoint() {
		var cp = snapshot(),
		    ts = new Date().getTime();

		currentTs = ts;

		checkpoints.push({ts: ts, cp: cp});
		saveCheckpoints();
	}

	function startLogging() {
		stopLogging();
		checkpoint();
		recording = true;
	}

	function stopLogging() {
		recording = false;
		log = [];
		checkpoints = [];
	}

	function pauseLogging() {
		recording = false;
	}

	function skipTo(ts, speed) {
		recording = false;

		// get the last checkpoint before ts
		var checkpoint = lastCheckpoint(ts),
		    changes;

		console.log("skip to", currentTs, ts, checkpoint.ts, (currentTs < ts && currentTs > checkpoint.ts));

		if (currentTs < ts && currentTs > checkpoint.ts) {
			// get list of changes that took place between ts and currentTs
			changes = changesInRange(currentTs, ts);

		} else if (currentTs > ts && currentTs != checkpoint.ts) {
			changes = changesInRange(ts, currentTs);
			changes.reverse();
		} else {
			// get list of changes that took place between ts and the prior snapshot
			changes = checkpoint && changesInRange(checkpoint.ts, ts);

			// set state to checkpoint
			checkpoint && init(checkpoint.cp);
		}

		// play back all changes from checkpoint to ts with no time delay between steps
		changes && play(changes, speed || 0);

		currentTs = ts;

		// return the current timestamp
		return changes ? changes[changes.length-1].ts : checkpoint && checkpoint.ts;
	}

	function changesInRange(fromTs, toTs) {
		fromTs = fromTs || 0;
		toTs = toTs || Infinity;
		return _.filter(log, function(c) {
			return (c.ts >= fromTs) && (c.ts <= toTs);
		});
	}
	
	function lastCheckpoint(ts) {
		var cps = [];

		if (ts) {
			cps = _.filter(checkpoints, function(v) {
				return v.ts < ts;
			});
		}

		cps = cps.length ? cps : [checkpoints[0]];

		return cps.length && cps[cps.length - 1];
	}


	// todo prevent repeated actions such as animations
	// separate user from system changes.
	function play(changes, speed, cb, stepFn) {
		recording = false;
		playing = true;
		speed = (speed || speed === 0) ? speed : 1;

		console.log("SPEED", speed);

		var i = 0,
		    rewind = changes.length > 1 && changes[0].ts > changes[1].ts,
			priorTs, nextTs, delay;

		function step() {
			if (changes && changes.length > i) {
				priorTs = changes[i].ts;
				nextTs = changes[i+1] ? changes[i+1].ts : priorTs;
				delay = (nextTs - priorTs) / speed;
				(function(_i) {
					var c = changes[_i];
					setState(c.path, rewind ? c.rollback : c.val, function() {
						stepFn && stepFn(c);
						currentTs = nextTs;
						setTimeout(step, delay);
					}, true);
				}(i++))

			} else {
				cb && cb(changes[i]);
				playing = false;
			}
		}

		step();
	}

	function playFrom(ts, speed, cb, stepFn) {
		ts = ts || 0;
		ts = skipTo(ts, speed);
		play(ts, speed || 1, cb, stepFn);
	}

	loadCheckpoints();

	return {
		init: init,
		setCb: setCb,
		get: getState,
		set: setState,
		update: updateState,
		replica: readReplica,
		verify: verify,
		history: {
			snapshot: snapshot,
			checkpoint: checkpoint,
			startLogging: startLogging,
			stopLogging: stopLogging,
			pauseLogging: pauseLogging,
			skipTo: skipTo,
			play: playFrom,
			getCurrentTs: function () {return currentTs},
			getLog: function() {
				return {log: log, checkpoints: checkpoints};
			}
		}
	};
};
