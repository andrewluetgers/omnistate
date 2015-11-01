module.exports = {

	get: function(structure, path) {
		var current = structure;
		path = !path ? [] : (path.substr ? path.split('.') : path || []);

		path.forEach(function(property) {
			if (current && property in current) {
				current = current[property];
			} else {
				current = undefined;
				return false;
			}
		});

		return current;
	},

	set: function(structure, path, value) {
		var currentObject = structure;
		path = !path ? [] : (path.substr ? path.split('.') : path || []);

		path.forEach(function(property, index) {
			if (index + 1 === path.length) {
				currentObject[property] = value;
			} else if (!currentObject[property]) {
				currentObject[property] = Number(path[index + 1]) ? [] : {};
			}
			currentObject = currentObject[property];
		});

		return structure;
	}


};