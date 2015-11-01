var _ = require('lodash');

module.exports = function diff(template, override) {
	if (!_.isObject(override)) {
		return undefined;
//				throw new Error("Missing or invalid argument");
	}

	// handle arrays
	if (!_.isObject(template) || (_.isArray(override) || _.isArray(template)) && !_.isEqual(template, override)) {
		return override;
	}

	var ret = {},
		hasDiff = false,
		oVal, tVal,
		keys = _.uniq(_.keys(template).concat(_.keys(override)));

	_.each(keys, function(name) {
		oVal = override[name];
		tVal = template[name];

		if (tVal && _.isObject(oVal) && !_.isArray(oVal)) {
			var _diff = diff(tVal, oVal);
			if (!_.isEmpty(_diff)) {
				hasDiff = true;
				ret[name] = _diff;
			}
		} else if (!_.isEqual(tVal, oVal)) {
			hasDiff = true;
			ret[name] = oVal;
		}
	});

	return hasDiff ? ret : null;
};