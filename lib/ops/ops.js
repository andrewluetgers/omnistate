
/**
 * @param operations {Object} defines condtions for executing an operation see description below
 * @param n new value from change handler
 * @param o old value from change handler
 * @param changes the difference between n and o
 * @param eventNameSpace string, just what is says
 *
 * the following values make up and operations description object
 *
 * conditions
 *
 *		require:	optional array of state members that must all be truthy (uses grab.js notation)
 *					supports negation with leading ! eg. require jobRunId to be falsey = "!jobRunId"
 *
 * 		change:     treated the same as below, use one or the other
 *		changes:	optional array of state members, any of which must have changed (uses grab.js notation)
 *					supports negation with leading ! eg. require jobRunId to not have changed = "!jobRunId"
 *
 * operation: the function to execute if the above conditions are met
 *
 * eg.
 * var operations = {
		 *		fetchClients: {
		 *			require: ["clientId"],
		 *			changes: ["user"],
		 *			operation: function() {
		 *				clientService.fetchClients(state);
		 *			}
		 *		}
		 *	};
 */

var _ = require('lodash');

var listeners = {},
	LKEY = "__listeners__";

module.exports = {
	/**
	 * @param operations {Object} defines condtions for executing an operation see description below
	 * @param n new value from change handler
	 * @param changes the difference between n and o
	 *
	 * the following values make up and operations description object
	 *
	 * conditions
	 *
	 *		require:	optional array of state members that must all be truthy (uses grab.js notation)
	 *					supports negation with leading ! eg. require jobRunId to be falsey = "!jobRunId"
	 *
	 * 		change:     treated the same as below, use one or the other
	 *		changes:	optional array of state members, any of which must have changed (uses grab.js notation)
	 *					supports negation with leading ! eg. require jobRunId to not have changed = "!jobRunId"
	 *
	 * operation: the function to execute if the above conditions are met
	 *
	 * eg.
	 * var operations = {
		 *		fetchClients: {
		 *			require: ["clientId"],
		 *			changes: ["user"],
		 *			operation: function() {
		 *				clientService.fetchClients(state);
		 *			}
		 *		}
		 *	};
	 */
	run: function(operations, n, changes, eventNameSpace) {
		eventNameSpace = eventNameSpace || "defaultNS";
		_.each(operations, function(op, name) {
			var opChanges = op.change || op.changes, // support change or changes
				requireMatch = !op.require,
				changeMatch = !opChanges;

			// filter on requires
			if (op.require) {
				requireMatch = _.all(op.require, function(requireVal) {
					if (requireVal.substr(0,1) == "!") {
						return requireVal && !_.get(n, requireVal.substr(1));
					} else {
						return requireVal && _.get(n, requireVal);
					}
				});
			}

			// filter on changes
			if (opChanges) {
				changeMatch = _.any(opChanges, function(change) {
					if (change.substr(0,1) == "!") {
						return changes && !_.get(changes, change.substr(1));
					} else {
						return changes && _.get(changes, change);
					}
				});
			}

			// if all conditions met, execute the operation
			if (requireMatch && changeMatch) {
				op.operation(n, changes, name, eventNameSpace);
			}
		});
	},

	// should be used just before the final render operation
	// this allows us to schedule events to happen after the user defined operations such as
	// targeted renders based on state changes
	// whereas the final render is a full app render, that happens when the url changes
	callMatching: {
		operation: function(n, c, eventName, eventNameSpace) {
			//console.log("call matching", listeners, arguments);
			if (c) {
				console.time('callMatching');
				callMatchingListeners(listeners[eventNameSpace], n, c);
				console.timeEnd('callMatching');
			}
		}
	},

	// configure the event nameSpace ahead of time so subscriers need not care about it
	eventSubscriber: function(eventNameSpace) {
		var self = this;
		return function (path, cb) {
			//console.log("subscribe", eventNameSpace, path, cb);
			return self.subscribe(eventNameSpace, path, cb);
		}
	},

	/**
	 *
	 * @param path (string) period separated key path
	 * @param cb (function) to call e.g. to render a component
	 * @returns {Function} unsubscriber
	 */
	subscribe: function(eventNameSpace, path, cb) {
		//console.log("subscribe", path);
		var listenersPath = path + "." + LKEY,
			eventListeners = listeners[eventNameSpace] = listeners[eventNameSpace] || {},
			subscribersNs = _.get(eventListeners, listenersPath);

		if (subscribersNs) {
			subscribersNs.push(cb);
		} else {
			subscribersNs = [cb];
			_.set(eventListeners, listenersPath, subscribersNs);
		}

		return function unsubFinishCb() {
			//console.log("unsubscribe", listenersPath);
			var subscribersNs = _.get(eventListeners, listenersPath),
				idx = subscribersNs.indexOf(cb);

			if (idx > -1) {
				subscribersNs.splice(idx, 1);
			}
		};
	}

};


// recursively traverse listeners for matches against changes
function getMatches(listeners, changes) {

	var m, matches = [];

	// todo support some kind of ignore children paths list
	for (var prop in listeners) {
		if (listeners.hasOwnProperty(prop) && prop !== LKEY && changes && prop in changes) {
			if (LKEY in listeners[prop]) {
				matches = matches.concat(listeners[prop][LKEY]);
			}
			if (typeof changes[prop] == 'object' && prop in listeners) {
				//console.log({prop:prop, changes:changes, listener:listeners[prop], change:changes[prop]});
				m = getMatches(listeners[prop], changes[prop]);
				matches = m ? matches.concat(m) : matches;
			}
		}
	}

	return matches;
}

function callMatchingListeners(listeners, n, c, r) {
	var called = [];
	console.log("CHANGE - callMatchingListeners", listeners, n, c, r, getMatches(listeners, c));
	if (c) {
		getMatches(listeners, c).forEach(v => {
			if (called.indexOf(v) < 0) {
				console.log("calling ", v);
				called.push(v);
				v(n, c, r);
			}
		});
	}
}