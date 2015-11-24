
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
			snapOnTime = currentTs - lastSnapShot > snapOnMs;
			snapOnCount = snapOnNDiffs < diffCount++;

			if (snapOnTime && snapOnCount) {
				lastSnapShot = currentTs;
				diffCount = 0;
				console.log("SNAP!", autoSnaps);
				autoSnaps.push({ts: currentTs, path: "<SNAPSHOT>", cp: clone(protectedState)});
			}

			console.log("DIFF", log);
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
	    autoSnaps = [],
		checkpoints = [],
	    log = [],
	    currentTs = "",
	    snapOnNDiffs = 10,
	    snapOnMs = 10000,
	    //maxDiffs = 100,
	    lastSnapShot = new Date().getTime(),
	    diffCount = 0,
	    timerId;


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
		lastSnapShot = ts;
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
		autoSnaps = [];
		checkpoints = [];
	}

	function pauseLogging() {
		recording = false;
	}

	function skipTo(ts, speed) {
		recording = false;

		// get the last full snap/check point before ts
		var point = bestPoint(ts),
		    changes;

		console.log("skip to", point, currentTs, ts, point.ts, (currentTs < ts && currentTs > point.ts));

		if (point && point.ts == ts) {
			currentTs = ts;
			point && init(point.cp);
			return ts;
		}


		if (currentTs < ts && currentTs > point.ts) {
			// snap...current...target
			// animate forward through changes from current to target
			// get list of changes that took place between ts and currentTs
			changes = changesInRange(currentTs, ts);

		} else if (currentTs > ts) {
			// target...current
			// animate back through changes from current to target
			changes = changesInRange(ts, currentTs);
			changes.reverse();
		} else {
			console.log("HUH?", currentTs, ts, point);
			//// get list of changes that took place between ts and the prior snapshot
			//changes = point && changesInRange(point.ts, ts);
			//
			//// set state to point
			//point && init(point.cp);
		}

		// play back all changes from point to ts with no time delay between steps
		changes && play(changes, speed || 0);

		currentTs = ts;

		// return the current timestamp
		return (changes && changes.length) ? changes[changes.length-1].ts : point && point.ts;
	}

	function changesInRange(fromTs, toTs, items) {
		fromTs = fromTs || 0;
		toTs = toTs || Infinity;
		items = items || log;
		return _.filter(items, function(c) {
			return (c.ts >= fromTs) && (c.ts <= toTs);
		});
	}
	
	function lastCheckpoint(ts, points) {
		var cps = [];

		points = points || checkpoints;

		if (ts) {
			cps = _.filter(points, function(v) {
				return v.ts < ts;
			});
		}

		cps = cps.length ? cps : [points[0]];

		return cps.length && cps[cps.length - 1];
	}

	function bestPoint(ts) {
		var cp = lastCheckpoint(ts),
			sn = lastCheckpoint(ts, autoSnaps);

		return !sn || cp.ts > sn.ts ? cp : sn;
	}


	// todo prevent repeated actions such as animations
	// separate user from system changes.
	function play(changes, speed, cb, stepFn) {
		clearTimeout(timerId);
		recording = false;
		playing = true;
		speed = (speed || speed === 0) ? speed : 1;

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
						timerId = setTimeout(step, delay);
					}, true);
				}(i));
				i++;

			} else {
				cb && cb(changes[i]);
				playing = false;
			}
		}

		step();
	}

	function playFrom(ts, speed, cb, stepFn) {
		ts = ts || 0;
		speed = (speed || speed === 0) ? speed : 1;
		ts = skipTo(ts, speed);
		play(ts, speed, cb, stepFn);
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
			//changesInRange: changesInRange,
			skipTo: skipTo,
			play: playFrom,
			//setMaxDiffs: function(val) {maxDiffs = val;},
			getCurrentTs: function () {return currentTs},
			getLog: function() {
				return {log: log, autoSnaps: autoSnaps, checkpoints: checkpoints};
			}
		}
	};
};
