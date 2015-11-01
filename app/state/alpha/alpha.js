
var immutable = require('immutable'),
    state = require('../state');

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function random(limit) {
	return Math.floor(Math.random() * limit);
}

function randomLetter() {
	return letters.charAt(random(letters.length));
}

function randomColor() {
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

var xSize = 100,
	ySize = 100,
	yi = 0,
	xi = 0;

module.exports = {
	init: function(snapshot) {
		state.update('alpha', () => {
			return immutable.fromJS(snapshot || {
				layout: this.blankTable(),
				run: false,
				visible: true
			});
		});
	},

	blankTable: function() {
		var layout = [];

		// gen our table of random letters
		for (var y = 0; y < ySize; y++) {
			layout[y] = [];
			for (var x = 0; x < xSize; x++) {
				layout[y][x] = {
					letter: '',//randomLetter(),
					color: 	randomColor(),
					active: false,
				};
			}
		}

		return layout;
	},

	fullTable: function() {
		var layout = [];

		// gen our table of random letters
		for (var y = 0; y < ySize; y++) {
			layout[y] = [];
			for (var x = 0; x < xSize; x++) {
				layout[y][x] = {
					letter: '',//randomLetter(),
					color: 	randomColor(),
					active: true,
				};
			}
		}

		return layout;
	},

	clearTheTable: function() {


		console.time("generate immutable data");
		var struct = immutable.fromJS(this.blankTable());
		console.timeEnd("generate immutable data");

		console.time("cloneDeep twice");
		//var x = _.cloneDeep(currentState.alpha.layout);
		//var y = _.cloneDeep(currentState.alpha.layout);
		var newObject = JSON.parse(JSON.stringify(currentState.alpha.layout));
		var newObject = JSON.parse(JSON.stringify(currentState.alpha.layout));
		//var x = _.cloneDeep({foo: 5});
		//var y = _.cloneDeep({foo: 5});
		//var newObject = JSON.parse(JSON.stringify({foo: 5}));
		//var newObject = JSON.parse(JSON.stringify({foo: 5}));
		console.timeEnd("cloneDeep twice");

		console.time("update and render new data");
		state.updateIn(["alpha", "layout"], ()=> struct);
		console.timeEnd("update and render new data");
	},

	fillTheTable: function() {
		console.time("generate immutable data");
		var struct = immutable.fromJS(this.fullTable());
		console.timeEnd("generate immutable data");

		console.time("cloneDeep twice");
		//var x = _.cloneDeep(currentState.alpha.layout);
		//var y = _.cloneDeep(currentState.alpha.layout);
		var newObject = JSON.parse(JSON.stringify(currentState.alpha.layout));
		var newObject = JSON.parse(JSON.stringify(currentState.alpha.layout));
		//var x = _.cloneDeep({foo: 5});
		//var y = _.cloneDeep({foo: 5});
		//var newObject = JSON.parse(JSON.stringify({foo: 5}));
		//var newObject = JSON.parse(JSON.stringify({foo: 5}));
		console.timeEnd("cloneDeep twice");

		console.time("update and render new data");
		state.updateIn(["alpha", "layout"], ()=> struct);
		console.timeEnd("update and render new data");
	},

	toggleRun: function() {
		state.updateIn(['alpha', 'run'], v=>!v);
	},

	toggleVisible: function() {
		state.updateIn(['alpha', 'visible'], v=>!v);
	},

	toggleRandomCell: function() {
		state.updateIn(['alpha', 'layout', random(ySize), random(xSize), 'active'], v=>!v);
	},

	toggleNextCell: function() {

		if (xi === xSize) {
			xi = 0;
			if (yi === ySize) {
				yi = 0;
			} else {
				yi++;
			}
		} else {
			xi++
		}

		state.updateIn(['alpha', 'layout', yi, xi, 'active'], v=>!v);
	}
};