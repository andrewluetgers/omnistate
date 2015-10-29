var webpack = 		require('webpack'),
    path = 			require('path'),
    pkg =		    require('./package.json');

var buildPath = path.join(__dirname, '/build/assets'),
    entrypoint = './app/App.jsx',
    useHttps = false,
    protocol = useHttps ? "https" : "http";


var devConfig = {
	cache: true,
	resolve: {extensions: ["", ".js", ".jsx", ".css", ".styl"]},
	entry:  [
		entrypoint,
		"webpack-dev-server/client?"+protocol+"://localhost:3001",
		"webpack/hot/dev-server"
	],
	devtool: 'eval',
	output: {
		path: buildPath,
		filename: pkg.name+'.js',
		publicPath: protocol+'://localhost:3001/assets/'
	},
	devServer: {
		headers: {"Access-Control-Allow-Origin": "*"}
	},
	module: {loaders: [
		{test: /\.js$|\.jsx$/, exclude: /node_modules/, loaders: ['react-hot', 'babel']},
		{test: /\.styl$/, loaders: ["style", "css", "stylus"]},
		{test: /\.css$/, loaders: ["style", "css"]}
	]},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	]
};

// we let gulp take care of stylus on build
var buildConfig = {
	cache: true,
	devtool: 'source-map',
	resolve: {extensions: ["", ".js", ".jsx"]},
	entry: [entrypoint],
	output: {path: buildPath, filename: pkg.name+'.js'},
	module: {loaders: [
		{test: /\.js$|\.jsx$/, exclude: /node_modules/, loaders: ['babel']}
	]},
	plugins: [
		new webpack.IgnorePlugin(/\.styl$|\.css$/),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin({minimize: true})
	]
};

module.exports = {
	dev: devConfig,
	build: buildConfig
};
