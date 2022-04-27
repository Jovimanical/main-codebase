var gulp = require('gulp'),
  browserSync = require('browser-sync');
    minifyCSS = require('gulp-minify-css');
// var postcss = require('gulp-postcss');
// var autoprefixer = require('autoprefixer-core');
// var mqpacker = require('css-mqpacker');
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

gulp.task('libsass', function () {
    // var processors = [
    //     autoprefixer({browsers: ['last 1 version']}),      
    // ];
    gulp.src(tuteria.sass + "/*.scss")
        .pipe($.changed(tuteria.css))
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest(tuteria.css))
        .pipe(gulp.dest(tuteria.dist + '/css'))
        // .pipe(reload({stream: true}));
});


gulp.task('libsass-min', function () {
    gulp.src(tuteria.sass + "/*.scss")
        // .pipe($.changed(tuteria.css))
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe(minifyCSS({compatibility: 'ie8'}))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest(tuteria.css))
        .pipe(gulp.dest(tuteria.dist + '/css'))
        // .pipe(reload({stream: true}));
});

// Browser sync server for live reload
gulp.task('browserSync', function() {
  browserSync.init(
      [paths.css + '/*.css', paths.js + '*.js', paths.templates + '/*.html'], {
        proxy: '127.0.0.1:8000',
      });
});
gulp.task('templates', function(){
  return gulp.src(paths.templates + '/**/*.html')
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function () {
    //  browserSync.init({
    //     proxy: "localhost:8002"
    // });
    gulp.watch(tuteria.templates + '/**/*.html', ['templates']);

    gulp.watch(tuteria.sass + "/*.scss", ['libsass'], function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    
    // gulp.watch(tuteria.templates+'*.html').on('change',reload);
});