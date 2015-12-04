// TODO implement an update that mixes in multiple values
// TODO debouncing and or second wall for renders getAnimationFrame
// TODO playback route changes somehow

var _ = require('lodash'),
    diff = require('../diff/diff');


function clone(obj) {
	return typeof obj == "object" ? JSON.parse(JSON.stringify(obj)) : obj;
}

function setDeepWithStableArrayLength(structure, path, value, oldSrc, newSrc) {
	var currentObject = structure,
	    currentOSrc = oldSrc || {},
	    currentNSrc = newSrc || {},
	    val, isArray;

	path = !path ? [] : (path.substr ? path.split('.') : path || []);

	path.forEach(function(property, index) {

		if (index + 1 === path.length) {
			currentObject[property] = value;

		} else if (!currentObject[property]) {
			isArray = Number(path[index + 1]);
			val = {};

			if (isArray && currentOSrc.length != currentNSrc.length) {
				val.length = currentNSrc.length;
			}

			currentObject[property] = val;
		}
		currentObject = currentObject[property];
		currentOSrc = currentOSrc[property] || {};
		currentNSrc = currentNSrc[property] || {};
	});

	return structure;
}


module.exports = function(debug) {

	var cb = function() {},
	    pushState = window.history.pushState,
		protectedState = {},
		readReplica = {},
	    setL = setDeepWithStableArrayLength;


	// todo record inits, use an internal base path
	function init(initialState) {
		_.assign(protectedState, clone(initialState));
		_.assign(readReplica, clone(initialState));
		if (playing) {
			console.log("PUSHSTATE", readReplica);
			var l = readReplica.route.location;
			pushState('init route change', r.title, l.pathname + l.search + l.hash);
		}
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

			setL(_diff, path, pdif, oldVal, newVal);
			_.set(protectedState, path, newVal);
			_.set(readReplica, path, replica);

			recording && logChange(path, val, oldVal);

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
	function setPushState(fn) {pushState = fn;}

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


	function logChange(path, val, oldVal) {
		currentTs = new Date().getTime();

		var snapOnTime = currentTs - lastSnapShot > snapOnMs,
		    snapOnCount = snapOnNDiffs < diffCount++,
		    rollup = log.length >= rollupEvery*2;

		if (rollup || snapOnTime && snapOnCount) {
			lastSnapShot = currentTs;
			diffCount = rollup ? log.length - rollupEvery : 0;

			rollup && log.splice(0, rollupEvery);
			//rollup && console.log("ROLLUP!", log.length, rollupEvery);

			autoSnaps.push({ts: currentTs, path: "<SNAPSHOT>", cp: clone(protectedState)});
			//console.log("SNAP!", autoSnaps);
		}

		!rollup && log.push({ts: currentTs, path: path, val: clone(val), rollback: clone(oldVal)});
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
	    rollupEvery = 500,
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

	function logSnapshot() {
		autoSnaps.push({ts: currentTs, path: "<SNAPSHOT>", cp: clone(protectedState)});
	}

	function startLogging() {
		stopLogging();
		logSnapshot();
		recording = true;
	}

	function stopLogging() {
		recording = false;
		log = [];
		autoSnaps = [];
		checkpoints = [];
	}

	function pauseLogging() {
		logSnapshot();
		recording = false;
	}

	function skipTo(ts, _speed) {
		var speed = _speed || 0;
		recording = false;

		// get the last full snap/check point before ts
		var point = lastSnap(ts),
		    changes;

		//console.log("skip to", currentTs, ts);

		// skip directly to a snapshot don't play changes
		if (point && point.ts == ts) {
			currentTs = ts;
			point && init(point.cp);
			return ts;
		}


		if (currentTs < ts && (!point || currentTs > point.ts)) {
			// snap...current...target
			//console.log("snap...current...target");
			// animate forward through changes from current to target
			// get list of changes that took place between ts and currentTs
			changes = changesInRange(currentTs, ts);

		} else if (currentTs > ts) {
			// snap?...target...current...snap?
			//console.log("snap?...target...current...snap?");
			// animate back through changes from current to target
			changes = changesInRange(ts, currentTs);
			changes.reverse();
		} else {
			//console.log("HUH?", currentTs, ts, point, " currentTs < point.ts ? ",  point && currentTs < point.ts);
			// get list of changes that took place between ts and the prior snapshot
			changes = point && changesInRange(point.ts, ts);

			// set state to point
			point && init(point.cp);
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
				return v.ts <= ts;
			});
		}

		cps = cps.length ? cps : [points[0]];

		return cps.length && cps[cps.length - 1];
	}

	function lastSnap(ts) {
		return lastCheckpoint(ts, autoSnaps);
	}


	// todo prevent repeated actions such as animations
	// separate user from system changes.
	function play(changes, speed, cb, stepFn) {
		clearTimeout(timerId);
		recording = false;
		playing = true;
		speed = (speed || speed === 0) ? speed : 1;

		var i = 0,
		    rewind = changes.length>1 && changes[0].ts > changes[1].ts,
			priorTs, nextTs, delay;

		function step() {
			if (changes && changes.length > i) {
				priorTs = changes[i].ts;
				nextTs = changes[i+1] ? changes[i+1].ts : priorTs;
				delay = speed ? (nextTs - priorTs) / speed : 0;

				if (i && rewind && priorTs == nextTs) {
					cb && cb(changes[i]);
					playing = false;
					return;
				}

				//console.log("STEP to ", nextTs, " from ", priorTs, delay, changes.length);

				(function(_i) {
					var c = changes[_i],
					    r = c.path == "route" && (rewind ? c.rollback : c.val);

					console.log("PUSHSTATE play", r);

					if (r) {
						console.log("history push state", r);
						var l = r.location;
						pushState('init route change', r.title, l.pathname + l.search + l.hash);
					}

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

	// seems odd
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
		setPushState: setPushState,
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
			getCurrentTs: function() {return currentTs},
			getLog: function() {
				return {log: log, autoSnaps: autoSnaps, checkpoints: checkpoints};
			},
			getOpts: function() {return {
				rollupEvery: rollupEvery,
				snapOnNDiffs: snapOnNDiffs,
				snapOnMs: snapOnMs
			}},
			setOpts: function(opts) {
				rollupEvery = opts.rollupEvery || rollupEvery;
				snapOnNDiffs = opts.snapOnNDiffs || snapOnNDiffs;
				snapOnMs = opts.snapOnMs || snapOnMs;
			}
		}
	};
};
