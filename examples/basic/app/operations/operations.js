
import alphaState from "../state/alpha/alpha"

module.exports = {

	all: {
		operation: function (state, diff) {
			// triggered on every state change
			//console.log("state change", arguments);
		}
	},

	wider: {
		requires: ['alpha.width'],
		changes: ['alpha.width'],
		operation: function (state, diff) {
			// alpha.width is truthy and has changed!
			console.log("wider")
		}
	}
};