var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function random(limit) {
	return Math.floor(Math.random() * limit);
}

function randomLetter() {
	return letters.charAt(random(letters.length));
}

var layout = [];
var size = 100;

for (var y = 0; y < size; y++) {
	layout[y] = [];
	for (var x = 0; x < size; x++) {
		layout[y][x] = {
			letter: randomLetter(),
			active: false
		};
	}
}

var state = immstruct({layout: layout});
var stateRef = state.reference();
var allRefs = {};

var omniscient = omniscient.withDefaults({ jsx: true });
//omniscient.debug();

// this configures createDefaultArguments to add mixins for the provided state
// these get used by a customized version of the omniscient component function
// to automatically add theses mixins for you, see bottom of file for impl
_mixins = forceUpdateOnState(state);



var Table = component('Table', {
		renderRow: function(row, rowIndex) {
			var self = this,
			    rowDom = row.map(function(cell, cellIndex) {
				    return self.renderCell(cell, cellIndex, rowIndex);
			    });
			return <tr key={rowIndex}>{rowDom}</tr>;
		},
		renderCell: function(cell, cellIndex, rowIndex) {
			var path = rowIndex+"."+cellIndex;
			return <Cell key={path} cursors={{cell: 'layout.'+path}} />;
		}
	},
	function() {
		return <table><tbody>{stateRef.cursor('layout').map(this.renderRow)}</tbody></table>;
	});
var Cell = component('Cell', function() {
	var cell = this.cell.toJS();
	return <td className={cell.active ? "active" : "inactive"}>{cell.letter}</td>;
});

React.render(<Table/>, document.getElementById('container'));




var stats = new Stats();
stats.setMode(0);

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


function update(ms) {
	stats.end();
	stats.begin();
	var x = random(size);
	var y = random(size);
	state.cursor('layout').updateIn([y, x, 'active'], function(val) {
		return !val;
	});
	setTimeout(update, ms);
}


update(0);




// experimental alternate rendering strategey with omniscient component function
// for more info see https://github.com/omniscientjs/omniscient/issues/93
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

function forceUpdateOnState(state, cursors) {

	return {
		componentWillMount: function() {
			var component = this;
			component._cancel = [];
			component._cursorIdx = [];
			// create references, force update on change, attach cursors
			component.references = getReferences(state, component);
			var refs = component.references;

			for (var name in refs) {
				// attach cursor to instance
				var ref = refs[name];

				component[name] = ref.cursor();

				// external refresh update all cursors
				//(function(name, component, ref) {
				//	component._cursorIdx.push(cursors.push(function () {
				//		component[name] = ref.cursor();
				//	}));
				//}(name, component, ref))

				// force update on change
				// store cleanup function unmount
				component._cancel.push(refs[name].observe('swap', function() {
					component.forceUpdate();
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
 * the value is a string is a space delimited path within provided state
 * @param state immstruct structure
 * @param component react component instance
 * @returns {someName: state.reference(['some', 'path']), ...}
 */

function getReferences(state, component) {
	var cursorDefs = component.cursors || {},
	    propDefs = (component.props && component.props.cursors) || {},
	    propRefs = (component.props && component.props.references) || {},
	    refs = {};

	// support passing references down to child
	for (var name in propRefs) {
		refs[name] = propRefs[name];
	}

	// support parent defining cursors in props
	// will override references provided in props
	for (var name in propDefs) {
		var pathStr = propDefs[name];
		refs[name] = allRefs[pathStr] || state.reference(pathStr.split("."));
		allRefs[pathStr] = refs[name];
	}

	// support component defining own cursors
	// will override prior cursors and references
	for (var name in cursorDefs) {
		var pathStr = cursorDefs[name];
		refs[name] = allRefs[pathStr] || state.reference(pathStr.split("."));
		allRefs[pathStr] = refs[name];
	}

	return refs;
}



function createDefaultArguments(displayName, mixins, render) {

	// (render)
	if (typeof displayName === 'function') {
		render      = displayName;
		mixins      = [];
		displayName = void 0;
	}

	// (mixins, render)
	if (typeof displayName === 'object' && typeof mixins === 'function') {
		render      = mixins;
		mixins      = displayName;
		displayName = void 0;
	}

	// (displayName, render)
	if (typeof displayName === 'string' && typeof mixins === 'function') {
		render = mixins;
		mixins = [];
	}

	// Else (displayName, mixins, render)

	if (!Array.isArray(mixins)) {
		mixins = [mixins];
	}


	mixins.unshift(_mixins);

	return {
		displayName: displayName,
		mixins: mixins,
		render: render
	};
}


function component(displayName, mixins, render) {
	var o = createDefaultArguments(displayName, mixins, render);
	return omniscient(o.displayName, o.mixins, o.render);
};

