var gulp = require('gulp');
var gutil = require("gulp-util");
var webpack = require("webpack");
// var browserSync = require('browser-sync').create();
// var reload      = browserSync.reload;
// var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./../webpack.config.js");
// var webpackConfig = require("./webpack.config.js");

var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')();

var pathsConfig = function (appName) {
    this.app = appName || appConfig.name;

    return {
        app: this.app,
        templates: this.app + '/templates',
        css: this.app + '/css',
        sass: this.app + '/sass',
        fonts: this.app + '/fonts',
        images: this.app + '/img',
        js: this.app + '/scripts',
        manageScript: this.app + '/manage.py',
        dist: 'tuteria/static/'
    };
};
var tuteria = pathsConfig('frontend/src');
console.log(tuteria.sass);

// gulp.task('runserver', function () {

//     var proc = exec('python tuteria/manage.py runserver 8002');
// });


gulp.task("build-dev", ["webpack:build-dev"], function () {
    gulp.watch(["frontend/**/*"], ["webpack:build-dev"]);
});

// Production build
// gulp.task("build", ["webpack:build",'libsass','imagemin','sprites','copyfonts']);

gulp.task("webpack:build", function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
            },
            output: {comments: false}
        })
    );

    // run webpack
    webpack(myConfig, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function (callback) {
    // run webpack
    devCompiler.run(function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});


// gulp.task("webpack-dev-server", function(callback) {
// 	// modify some webpack config options
// 	var myConfig = Object.create(webpackConfig);
// 	myConfig.devtool = "eval";
// 	myConfig.debug = true;

// // 	// Start a webpack-dev-server
// 	new WebpackDevServer(webpack(myConfig), {
// 		publicPath: "/" + myConfig.output.publicPath,
// 		stats: {
// 			colors: true
// 		}
// 	}).listen(8010, "localhost", function(err) {
// 		if(err) throw new gutil.PluginError("webpack-dev-server", err);
// 		gutil.log("[webpack-dev-server]", "http://localhost:8010/webpack-dev-server/index.html");
// 	});
// });


// gulp.task('browser-sync', function() {
//     browserSync.init({
//         proxy: "localhost:8002"
//     });
// });
