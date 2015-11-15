

/**
 * forceUpdateWithSubscription
 *
 * @param getSerializedState function - a function that returns a plain json object of app state
 * @param subscribe function(keyPath, cb)- should set up a subscripton on a key path into the state
 * that when state at that path is changed will call a provided callback.
 *
 * @return object - mixins for a react component (componentWillMount, componentWillUpdate, componentWillUnmount)
 *
 * given these two things we can configure mixins that will cause the view to render independently of their parent
 *
 * the subscribing process is automatic when you follow the convention of defining
 * paths on the app state that the component will need to react to. Think of this as an alternative
 * to props that grabs values directly from app state.
 *
 * In the component define databindings on a dataBindings property like below
 *
 * databindings: {
 *      foo: "bar.baz.foo"
 *}
 *
 * now you can access this.foo to get the latest value of bar.baz.foo in the app state
 * this will also force the component to render any time
 * the value at that path changes
 */

var _ = require('lodash');

// todo support some kind of ignore children paths syntax
function forceUpdateWithSubscription(getSerializedState, subscribe) {

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
				kp = keyPaths[name];
				getterPaths[name] = kp;
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

				component[getterName] = () => _.get(getSerializedState(), getterPaths[name]);
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
}


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

