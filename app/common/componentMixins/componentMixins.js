/**
 * forceUpdateWithSubscription
 *
 * @param state immstruct structure
 * @param subscribe function(keyPath, cb)
 * @returns component mixins {componentWillMount, componentWillUpdate, componentWillUnmount}
 *
 * the parent component should provide to the target component
 * a map of prop names as keys for dataBindings and period delimited path strings
 * on as 'dataBindings' property, e.g. <div dataBindings={{foo: 'bar.foo'}}></div>
 * in the above example: props.foo = state.reference(['bar', 'foo']).cursor()
 * updates will not be top-down component will watch the path ref and
 * force update upon any change
 */

// todo support some kind of ignore children paths syntax
function forceUpdateWithSubscription(getSerializedState, subscribe) {

	var _ = require('lodash');

	return {
		componentWillMount: function() {
			//console.log("subscribe components to matching state changes");
			var component = this,
				keyPaths = getKeyPaths(this, "dataBindings"),
			    getterPaths = getKeyPaths(this, "getters"),
			    kp;
			//console.log("key paths", keyPaths);

			component._cancel = [];
			component.bindings = {};

			function forceUpdate() {
				component.isMounted() && component.forceUpdate();
			}

			for (var name in keyPaths) {
				if (name in component) {
					throw new Error("Name '"+name+"' in use.");
				}

				// attach cursor to instance
				kp = keyPaths[name].join(".");
				component.bindings[name] = component[name] = _.get(getSerializedState(), kp);

				// force update on change, store cleanup function for unmount
				// important, all subscriber callbacks should be === per component
				// this allows us to avoid multiple renders when multiple changes occur
				component._cancel.push(subscribe(kp, forceUpdate));
			}

			for (var name in getterPaths) {
				//console.log("getter path", name, component);
				// attach cursor to instance
				var cap = name[0].toUpperCase(),
				    rest = name.substr(1),
				    getterName = 'get'+cap+rest;

				if (getterName in component) {
					throw new Error("Getter Name '"+getterName+"' in use.");
				}

				component[getterName] = () => _.get(getSerializedState(), getterPaths[name].join("."));
			}
		},

		componentWillUpdate: function() {
			// update dataBindings
			var component = this,
				keyPaths = getKeyPaths(this, "dataBindings");

			for (var name in keyPaths) {
				component[name] = _.get(getSerializedState(), keyPaths[name]);
				//console.log("updating dataBindings", name, component[name]);
			}
		},

		componentWillUnmount: function() {
			// cancel observers
			this._cancel.forEach(function(fn) {fn()});
		}
	};
};

/**
 * getReferences
 * expects either a member or prop of 'dataBindings' such as {foo: 'foo', baz: 'bar.baz'}
 * where the key is the name of a new member to add to the instance and
 * the value is a space delimited path within provided state
 * @param state immstruct structure
 * @param component omniscient or react component instance
 * @returns {someName: state.reference(['some', 'path']), ...}
 */

var references = {};

function getReferences(state, component) {
	var sources = {
			// support component defining own dataBindings
			componentDefs: component.dataBindings,
			// support parent defining dataBindings in props, will override prior dataBindings
			propDefs: (component.props && component.props.dataBindings)
		},
		refs = {};

	for (var source in sources) {
		var cursorDefs = sources[source];

		for (var name in cursorDefs) {
			var selector = cursorDefs[name];
			// in conjunction with forceUpdateOnState will attache references and dataBindings to the instance
			// it will also register reference observers that will force render and refresh dataBindings upon change
			references[selector] = refs[name] = (references[selector] || state.reference(selector.split(".")));
		}
	}

	return refs;
}

function getKeyPaths(component, pathsMember) {
	var sources = {
			// support component defining own dataBindings
			componentDefs: component[pathsMember],
			// support parent defining dataBindings in props, will override prior dataBindings
			propDefs: (component.props && component.props[pathsMember])
		},
		keyPaths = {};

	for (var source in sources) {
		var cursorDefs = sources[source];

		for (var name in cursorDefs) {
			var selector = cursorDefs[name];
			keyPaths[name] = selector.split(".");
		}
	}

	return keyPaths;
}

module.exports.forceUpdateWithSubscription = forceUpdateWithSubscription;
