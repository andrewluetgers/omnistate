
module.exports = {
	// keep in sync with webpack styles below
	stylSrc: ["./app/App.styl"],

	webpackStylesBootstrap: function() {
		// this bootstraps the Webpack hot-loading style compilation
		// using a try block because build output of this blows up in the browser
		// keep in sync with above
		try {
			require('./app/App.styl');
		} catch (e) {}
	}
};

