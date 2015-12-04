var path = require('path'),
	webpack = require('webpack');

module.exports = {
	devtool: 'cheap-module-eval-source-map',
	entry: [
		'webpack-hot-middleware/client',
		'./app/App.jsx'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: '/static/'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	],
	module: {
		loaders: [
			{test: /\.js$|\.jsx$/, loaders: ['babel'], exclude: /node_modules/},
			{test: /\.styl$|\.css$/, loaders: ["style", "css", "stylus"]}
		]
	}
};


// When inside omnistate repo, prefer src to compiled version.
// You can safely delete these lines in your project.
//var fs = require('fs'),
//	omnistateSrc = path.join(__dirname, '..', '..', 'lib');
//
//if (fs.existsSync(omnistateSrc)) {
//	// Resolve omnistate to source
//	module.exports.resolve = { alias: { 'omnistate': omnistateSrc } };
//	// Compile omnistate from source
//	module.exports.module.loaders.push({test: /\.js$|\.jsx$/, loaders: [ 'babel' ], include: omnistateSrc})
//}

