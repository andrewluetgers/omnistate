"use strict";

var listeners = {},
	LKEY = "__listeners__";

// should be used just before the final render operation
// this allows us to schedule events to happen after the user defined operations such as
// targeted renders based on state changes
// whereas the final render is a full app render, that happens when the url changes
function callMatching(n, c, eventNameSpace) {
	c && callMatchingListeners(listeners[eventNameSpace], n, c);
}

// configure the event nameSpace ahead of time so subscriers need not care about it
function subscriber(eventNameSpace) {
	return function (path, cb, identity) {
		//console.log("subscribe", eventNameSpace, path, cb);
		return subscribe(eventNameSpace, path, cb, identity);
	}
}

/**
 *
 * @param path (string) period separated key path
 * @param cb (function) to call e.g. to render a component
 * @returns {Function} unsubscriber
 */
function subscribe(eventNameSpace, path, cb, identity) {
	//console.log("subscribe", path);
	var pStr = path.join("."),
		listenersPath = (pStr === "*" ? "*" : "*." + pStr) + "." + LKEY,
	    eventListeners = listeners[eventNameSpace] = listeners[eventNameSpace] || {},
	    subscribersNs = _.get(eventListeners, listenersPath),
	    listenerObj = {callback: cb, identity: identity};

	console.log("subscribe --------------------", listenersPath, listeners);

	if (subscribersNs) {
		subscribersNs.push(listenerObj);
	} else {
		subscribersNs = [listenerObj];
		//console.log("add path to listeners", listenersPath);
		_.set(eventListeners, listenersPath, subscribersNs);
	}

	return function unsubFinishCb() {
		//console.log("unsubscribe", listenersPath);
		var subscribersNs = _.get(eventListeners, listenersPath),
		    idx = subscribersNs.indexOf(listenerObj);

		if (idx > -1) {
			subscribersNs.splice(idx, 1);
		}
	};
}



// recursively traverse listeners for matches against changes
function getMatches(listeners, changes) {

	var m, matches = [];

	//console.log("get matches", listeners, changes);

	// todo support some kind of ignore children paths list
	for (var prop in listeners) {
		if (listeners.hasOwnProperty(prop) && prop !== LKEY && changes && prop in changes) {
			if (LKEY in listeners[prop]) {
				matches = matches.concat(listeners[prop][LKEY]);
			}
			if (typeof changes[prop] == 'object' && prop in listeners) {
				//console.log({prop: prop, changes: changes, listener: listeners[prop], change: changes[prop]});
				m = getMatches(listeners[prop], changes[prop]);
				matches = m ? matches.concat(m) : matches;
			}
		}
	}

	return matches;
}

function callMatchingListeners(listeners, n, c, r) {
	var called = [];
	console.log("call matching", arguments);
	if (c) {
		getMatches(listeners, {"*": c}).forEach(function(v) {
			console.log("calling matching", v);
			if (called.indexOf(v.identity) < 0) {
				called.push(v.identity);
				v.callback(n, c, r);
			}
		});
	}
}


module.exports = {
	callMatching: callMatching,
	subscriber: subscriber
};