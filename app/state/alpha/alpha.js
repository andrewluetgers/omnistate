
var state;

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
		state = require('../state');
		console.log("INIT ALPHA", state);
		state.update('alpha', () => {
			return snapshot || {
				layout: this.blankTable(),
				run: false,
				visible: true
			};
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
					active: false
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
					active: true
				};
			}
		}

		return layout;
	},

	clearTheTable: function() {
		console.time("update and render new data");
		state.set("alpha.layout", this.blankTable());
		console.timeEnd("update and render new data");
	},

	fillTheTable: function() {
		console.time("update and render new data");
		state.set("alpha.layout", this.fullTable());
		console.timeEnd("update and render new data");
	},

	toggleRun: function() {
		state.update('alpha.run', v=>!v);
	},

	toggleVisible: function() {
		state.update('alpha.visible', v=>!v);
	},

	toggleRandomCell: function() {
		state.update(['alpha', 'layout', random(ySize), random(xSize), 'active'], v=>!v);
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

		state.update(['alpha', 'layout', yi, xi, 'active'], v=>!v);
	}
};