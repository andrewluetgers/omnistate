
var state = require('../../common/omni/omni').state;

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

var defaults = {
	width: 10,
	height: 10,
	layout: [],
	run: false,
	visible: false
};


module.exports = {
	init: function(snapshot) {
		console.log("INIT ALPHA", state);
		state.update('alpha', ()=> {
			var res = snapshot || defaults;
			return {
				width: res.width,
				height: res.height,
				layout:  this.blankTable(res.width, res.height),
				run: res.run,
				visible: res.visible
			};
		});
	},

	newLayout: function(w, h) {
		state.update("alpha", v => {
			v.width = w;
			v.height = h;
			v.layout = this.blankTable(w, h);
			return v;
		});
	},

	blankTable: function(w, h) {
		var layout = [];

		// gen our table of random letters
		for (var y = 0; y < h; y++) {
			layout[y] = [];
			for (var x = 0; x < w; x++) {
				layout[y][x] = {
					letter: '', //randomLetter(),
					color: 	randomColor(),
					active: false
				};
			}
		}

		return layout;
	},

	fullTable: function(w, h) {
		var layout = [];

		// gen our table of random letters
		for (var y = 0; y < h; y++) {
			layout[y] = [];
			for (var x = 0; x < w; x++) {
				layout[y][x] = {
					letter: '',//randomLetter(),
					color: 	randomColor(),
					active: true
				};
			}
		}

		return layout;
	},

	clearTheTable: function(w, h) {
		console.time("update and render new data");
		state.set("alpha.layout", this.blankTable(w, h));
		console.timeEnd("update and render new data");
	},

	fillTheTable: function(w, h) {
		console.time("update and render new data");
		state.set("alpha.layout", this.fullTable(w, h));
		console.timeEnd("update and render new data");

	},

	toggleRun: function() {
		state.update('alpha.run', v=>!v);
	},

	toggleVisible: function() {
		console.log("toggle visibility");
		state.update('alpha.visible', v=>{
			console.log("invert", v, !v);
			return !v;
		});
	},

	toggleRandomCell: function(w, h) {
		state.update(['alpha', 'layout', random(h), random(w), 'active'], v=>!v);
	},

	toggleNextCell: function(w, h) {

		if (xi >= w) {
			xi = 0;
			if (yi >= h) {
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