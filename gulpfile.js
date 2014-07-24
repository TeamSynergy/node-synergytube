var gulp = require('gulp');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
  js: ['**.js', '*/**.js', '!node_modules/**', '!gulpfile.js']
};

gulp.task('lint', function(){
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
});

gulp.task('default', ['lint']);