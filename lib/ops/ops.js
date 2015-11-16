"use strict";

var _ = require('lodash');

/**
 * @param operations {Object} defines condtions for executing an operation see description below
 * @param n new value from change handler
 * @param changes the difference between n and o
 * @param eventNameSpace {string} a unique namespace for all associated subscribers
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
function ops(operations, n, changes, eventNameSpace) {
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
}

module.exports = ops;