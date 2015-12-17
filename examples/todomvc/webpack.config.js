var path = require('path'),
	webpack = require('webpack');

module.exports = {
	devtool: 'cheap-module-eval-source-map',
	entry: [
		'webpack-hot-middleware/client',
		'./app/App.jsx',
		'./app/App.styl'
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