var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var gutil = require('gulp-util');

// Check the code quality
gulp.task('qualitychecker', function(cb) {
    return gulp.src([
      'src/**/*.js',
      '!test/**/*.js'])
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('default'))
    .on('error', gutil.log);
});

// run the tests (mocha) and report its code coverage
// (see the results on reports/coverage.html)
gulp.task('test', ['qualitychecker'], function () {
    return gulp.src('tests/**/*.js', { read: false })
            .pipe(cover.instrument({
                pattern: ['lib/**/*.js'],
                debugDirectory: 'debug'
            }))
            .pipe(mocha())
            .pipe(cover.gather())
            .pipe(cover.format())
            .pipe(gulp.dest('reports'));
});

gulp.task('default', ['test']);
