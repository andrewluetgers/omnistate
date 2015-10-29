/**
 * forceUpdateWithSubscription
 *
 * @param state immstruct structure
 * @param subscribe function(keyPath, cb)
 * @returns component mixins {componentWillMount, componentWillUpdate, componentWillUnmount}
 *
 * the parent component should provide to the target component
 * a map of prop names as keys for cursors and period delimited path strings
 * on as 'cursors' property, e.g. <div cursors={{foo: 'bar.foo'}}></div>
 * in the above example: props.foo = state.reference(['bar', 'foo']).cursor()
 * updates will not be top-down component will watch the path ref and
 * force update upon any change
 */

function forceUpdateWithSubscription(getSerializedState, subscribe) {

	var _ = require('lodash');

	return {
		componentWillMount: function() {
			var component = this;
				keyPaths = getKeyPaths(this);

			component._cancel = [];

			function forceUpdate() {
				//console.log("force update", arguments);
				component.isMounted() && component.forceUpdate();
			}

			for (var name in keyPaths) {
				// attach cursor to instance
				component[name] = _.get(getSerializedState(), keyPaths[name].join("."));

				// force update on change, store cleanup function for unmount
				// important, all subscriber callbacks should be === per component
				// this allows us to avoid multiple renders when multiple changes occur
				component._cancel.push(subscribe(keyPaths[name].join('.'), forceUpdate));
			}
		},

		componentWillUpdate: function() {
			// update cursors
			var component = this,
				keyPaths = getKeyPaths(this);

			for (var name in keyPaths) {
				component[name] = _.get(getSerializedState(), keyPaths[name]);
				//console.log("updating cursors", name, component[name]);
			}
		},

		componentWillUnmount: function() {
			// cancel observers
			this._cancel.forEach(function(fn) {fn()});
		}
	};
};


/**
 * forceUpdateOnState
 *
 * @param state immstruct structure
 * @returns component mixins {componentWillMount, componentWillUpdate, componentWillUnmount}
 *
 * the parent component should provide to the target component
 * a map of prop names as keys for cursors and period delimited path strings
 * on as 'cursors' property, e.g. <div cursors={{foo: 'bar.foo'}}></div>
 * in the above example: props.foo = state.reference(['bar', 'foo']).cursor()
 * updates will not be top-down component will watch the path ref and
 * force update upon any change
 */

function forceUpdateOnState(state) {

	return {
		componentWillMount: function() {
			var component = this;
			component._cancel = [];
			// create references, force update on change, attach cursors
			component.references = getReferences(state, component);
			var refs = component.references;

			for (var name in refs) {

				// attach cursor to instance
				var ref = refs[name];

				component[name] = ref.cursor();

				// force update on change
				// store cleanup function unmount
				component._cancel.push(ref.observe('swap', function() {
					//console.log("force update", name);
					component.isMounted() && component.forceUpdate();
				}));
			}
		},

		componentWillUpdate: function() {
			// update cursors
			var component = this,
				refs = component.references;

			for (var name in refs) {
				component[name] = refs[name].cursor();
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
 * expects either a member or prop of 'cursors' such as {foo: 'foo', baz: 'bar.baz'}
 * where the key is the name of a new member to add to the instance and
 * the value is a space delimited path within provided state
 * @param state immstruct structure
 * @param component omniscient or react component instance
 * @returns {someName: state.reference(['some', 'path']), ...}
 */

var references = {};

function getReferences(state, component) {
	var sources = {
			// support component defining own cursors
			componentDefs: component.cursors,
			// support parent defining cursors in props, will override prior cursors
			propDefs: (component.props && component.props.cursors)
		},
		refs = {};

	for (var source in sources) {
		var cursorDefs = sources[source];

		for (var name in cursorDefs) {
			var selector = cursorDefs[name];
			// in conjunction with forceUpdateOnState will attache references and cursors to the instance
			// it will also register reference observers that will force render and refresh cursors upon change
			references[selector] = refs[name] = (references[selector] || state.reference(selector.split(".")));
		}
	}

	return refs;
}

function getKeyPaths(component) {
	var sources = {
			// support component defining own cursors
			componentDefs: component.cursors,
			// support parent defining cursors in props, will override prior cursors
			propDefs: (component.props && component.props.cursors)
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

module.exports.forceUpdateOnState = forceUpdateOnState;
module.exports.forceUpdateWithSubscription = forceUpdateWithSubscription;
