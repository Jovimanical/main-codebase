var gulp = require('gulp');
require('require-dir')('./gulp-tasks');

gulp.task('default', ['webpack:build', 'libsass-min', 'imagemin','copyfonts']);
