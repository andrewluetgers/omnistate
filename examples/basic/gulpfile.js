var fs = 				require('fs'),
    gulp =				require('gulp'),
    plumber = 			require('gulp-plumber'),
    sourcemaps = 		require('gulp-sourcemaps'),
    gulpSequence = 		require('gulp-sequence'),
    stylus =			require('gulp-stylus'),
    rename = 			require("gulp-rename"),
    pkg = 			    require('./package.json'),
    styles = 			require('./styles'),

    // webpack for js build and live-coding
    webpack = 			require('webpack'),
    WebpackDevServer = 	require('webpack-dev-server'),
    webpackConfig = 	require('./webpack.config');


var build =		'./build',
    assets =	'/assets',
    dest =		build + assets,
    stylSrc =	styles.stylSrc,
    copySrc =	['./app/assets/*', './app/assets/**', './app/view/index.dot'],
    cleanPath = __dirname + "/build", // should be full path, does recursive delete
    opts = 		{errorHandler: function() {console.log("error", arguments)}},
    devPort = 	3001,
    statsCfg = {
	    colors: true,
	    hash: true,
	    timings: true,
	    assets: true,
	    chunks: false,
	    chunkModules: true,
	    modules: false,
	    children: true
    };



gulp.task('webpack-build', ['clean'], function(callback) {
	webpack(webpackConfig.build, function(err, stats) {
		console.log("webpack-build:", stats.toString(statsCfg));
		callback();
	});
});


gulp.task("webpack-dev-server", function(callback) {

	var useHttps = webpackConfig.dev.output.publicPath.match(/^https/);
	var protocol = useHttps ? "https" : "http";
	var compiler = webpack(webpackConfig.dev, function(err, stats) {
		console.log("webpack-build:", stats.toString(statsCfg));

		// hack: tickle the entrypoint to force an initial compilation
		var data = fs.readFileSync(webpackConfig.dev.entry[0], 'utf-8');
		fs.writeFileSync(webpackConfig.dev.entry[0], data, 'utf-8');

		setTimeout(function() {
			console.log("----------------------- hot load server ----------------------------");
			if (useHttps) {
				console.log("If HTTPS fails in the browser directly load the failed url.");
				console.log("it will be listed in the net panel.");
				console.log("Once loaded you can set the needed security exception.");
				console.log("--------------------------------------------------------------------");
			}
		}, 2000);
	});

	new WebpackDevServer(compiler, {
		https:			useHttps,
		noInfo:			true,
		hot: 			true,
		contentBase: 	protocol+'://localhost:3001',
		publicPath: 	protocol+'://localhost:3001/assets/',
		headers: 		{"Access-Control-Allow-Origin": "*"},
		stats: 			{colors: true}
	}).listen(devPort, 'localhost', function (err, result) {
		if (err) {throw new Error("webpack-dev-server", err);}
		console.log('Webpack dev-server listening at localhost:' + devPort);
	});
});



gulp.task('styl', function() {
	gulp.src(stylSrc)
			.pipe(plumber(opts))
			.pipe(sourcemaps.init({debug: true}))
			.pipe(stylus({compress: true}))
			.pipe(rename(pkg.name+".css"))
			.pipe(sourcemaps.write('.', {includeContent: true, debug: true}))
			.pipe(gulp.dest(dest));
});

gulp.task('copy', function() {
	return gulp.src(copySrc)
			.pipe(plumber(opts))
			.pipe(gulp.dest(dest));
});

gulp.task('clean', function(cb) {
	deleteFolderRecursive(cleanPath);
	cb && cb();
});

gulp.task('watch', function() {
	gulp.watch(copySrc, ['copy']);
});

gulp.task('default', gulpSequence(['clean'], ['copy', 'styl'], 'webpack-build'));


gulp.task('dev', gulpSequence('clean', ['copy', 'webpack-dev-server', 'watch']));



// use with caution!!
function deleteFolderRecursive(path) {
	if( fs.existsSync(path) ) {
		fs.readdirSync(path).forEach(function(file){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}
