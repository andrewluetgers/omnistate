var omni = require('omnistate');

export default {
	init: function() {
		omni.controller("widthExample", {
			proxies: {
				width: 'alpha.width'
			}
		}, function() {
			console.log("example controller width -------------------", arguments, this, this.width);
		});

		omni.controller("sizeExample", {
			proxies: {
				size: 'alpha.size'
			}
		}, function() {
			console.log("example controller size-------------------", this, this.size);
		});


		omni.computed({

			'alpha.size': [
				['alpha.width', 'alpha.height'],
				(w, h) => w * h
			],

			'alpha.size2': [
				['alpha.size'],
				s => s * 2
			]

		});
	}
};