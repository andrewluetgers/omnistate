/**
 * proxyMixins aka forceUpdateWithSubscription
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
 * In the component define proxies on a proxies property like below
 *
 * proxies: {
 *      foo: "bar.baz.foo"
 *}
 *
 * now you can access this.foo to get the latest value of bar.baz.foo in the app state
 * this will also force the component to render any time
 * the value at that path changes
 */

var _ = require('lodash');

// todo support some kind of ignore children paths syntax
// todo support props as overrides ??
function proxyMixins(stateContainer, subscribe, debug) {

	return {
		componentWillMount: function() {

			var component = this,
			    keyPaths = getKeyPaths(this, "proxies");

			//console.log("<"+component.constructor.displayName+">", "MOUNT");

			component._cancel = [];
			component.bindings = {};

			function forceUpdate() {
				component.isMounted() && component.forceUpdate();
			}

			function debugForceUpdate(path) {
				console.debug("<"+component.constructor.displayName+">", "force update triggered by", path.join(", "));
				forceUpdate();
			}

			if (component.onStateChange) {
				//console.log("<"+component.constructor.displayName+">", "SUBSCRIBE OSC");
				component._cancel.push(subscribe(["*"], component.onStateChange), component);
			}

			for (var name in keyPaths) {

				if (name in component) {
					throw new Error("<"+component.constructor.displayName+"> already using property name '"+name+"'.");
				}

				var sc = stateContainer,
					path = keyPaths[name],
				    cap = name[0].toUpperCase(),
				    rest = name.substr(1),
				    setterName = 'set'+cap+rest,
				    setter = function(v) { (typeof v == "function") ? sc.update(path, v) : sc.set(path, v)};

				//console.log("init --------", setterName);

				component[name] = _.get(sc.replica, path);
				component[setterName] = setter;

				if (path.renderOnUpdate) {
					// force update on change, store cleanup function for unmount
					// important, all subscriber callbacks should be === per component
					// this allows us to avoid multiple renders when multiple changes occur
					debug
						? component._cancel.push(subscribe(path, function() {debugForceUpdate(path)}, component))
						: component._cancel.push(subscribe(path, forceUpdate, component));
				}
			}
		},

		componentWillUpdate: function() {
			var component = this,
			    keyPaths = getKeyPaths(this, "proxies");

			for (var name in keyPaths) {
				var path = keyPaths[name];
				component[name] = _.get(stateContainer.replica, path);
			}
		},

		componentWillUnmount: function() {
			// cancel observers
			this._cancel.forEach(function(fn) {fn()});
		}
	};
}

function getKeyPaths(component, pathsMember) {
	var sources = {
		    // support component defining own proxies
		    componentDefs: component[pathsMember],
		    // support parent defining proxies in props, will override prior proxies
		    propDefs: (component.props && component.props[pathsMember])
	    },
	    keyPaths = {};

	for (var source in sources) {
		var proxyDefs = sources[source];

		for (var name in proxyDefs) {
			var sel = proxyDefs[name],
			    renderOnUpdate = sel[0] != "@",
				keys;

			sel = renderOnUpdate ? sel : sel.substr(1);
			keys = sel.split(".");
			keys.renderOnUpdate = renderOnUpdate;
			keyPaths[name] = keys;
		}
	}

	//console.log("getKeyPaths", keyPaths);
	return keyPaths;
}

module.exports = proxyMixins;
