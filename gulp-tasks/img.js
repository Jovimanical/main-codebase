var gulp = require('gulp')
// var imagemin = require('gulp-imagemin');
// var pngquant = require('imagemin-pngquant');

// var gifsicle = require('imagemin-gifsicle');
// var jpegtran = require('imagemin-jpegtran');
// // var sprite = require('css-sprite').stream;
// var exec = require('child_process').exec;
// var $ = require('gulp-load-plugins')(),
//     path = require('path'),
//     changed = require('gulp-changed'),
//     plumber = require('gulp-plumber');

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

gulp.task('copyfonts', function () {
    gulp.src(tuteria.fonts + '/**/*.{ttf,woff,eof,svg,eot,woff2}')
        .pipe(gulp.dest(tuteria.dist + '/fonts'));
});


// // // gulp.task('uncss', function () {
// // //     return gulp.src(tuteria.dist + '/css/*.css')
// // //         .pipe($.concat('main.css'))
// // //         .pipe($.uncss({
// // //             html: [
// // //                 'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //                 //'http://127.0.0.1:8002/',
// // //             ]
// // //         }))
// // //         //.pipe($.csso())
// // //         .pipe(gulp.dest(tuteria.dist + '/css'));
// // // });

// // // // generate sprite.png and _sprite.scss
// // // gulp.task('sprites', function () {
// // //     return gulp.src(tuteria.images + '/level_icons/*.png')
// // //         .pipe(sprite({
// // //             name: 'sprite',
// // //             style: '_sprite.scss',
// // //             cssPath: './img',
// // //             processor: 'scss'
// // //         }))
// // //         .pipe($.if('*.png', gulp.dest(tuteria.dist + '/img'), gulp.dest(tuteria.sass + '/src')))
// // // });
// // // // generate scss with base64 encoded images
// // // gulp.task('base64', function () {
// // //     return gulp.src('./src/img/*.png')
// // //         .pipe(sprite({
// // //             base64: true,
// // //             style: '_base64.scss',
// // //             processor: 'scss'
// // //         }))
// // //         .pipe(gulp.dest('./dist/scss/'));
// // // });

// gulp.task('imagemin', function () {
//     return gulp.src(tuteria.images + '/**/*.{png,jpg,gif}')

//         .pipe($.changed(tuteria.dist + '/img'))
//         .pipe($.imagemin({
//             optimizationLevel: 7,
//             progressive: true,
//             cache:false,
//             svgoPlugins: [{removeViewBox: false}],
//             use: [gifsicle({interlaced: true}), jpegtran({progressive: true})]
//             // use: [pngquant({quality: '65-80', speed: 4}), gifsicle({interlaced: true}), jpegtran({progressive: true})]
//         }))
//         .pipe(gulp.dest(tuteria.dist + '/img'));
// });


