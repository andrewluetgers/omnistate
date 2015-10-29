var routeMatcher = require('route-matcher').routeMatcher,
	_ = require('lodash');

var matchers = [],
	baseRoute = "/",
	validRoutes = [
		{route: baseRoute, 					name: "Base", 		action: "base", 		actionPath: "base"}
	];

module.exports = {
	routes: validRoutes,
	byRoute: {},
	byAction: {},
	match: function(url) {
		return _.find(validRoutes, function(v, i) {
			return matchers[i].parse(url);
		});
	}
};

validRoutes.forEach(function(v) {
	matchers.push(routeMatcher(v.route));
	module.exports.byRoute[v.route] = v;
	module.exports.byAction[v.action] = v;
});

