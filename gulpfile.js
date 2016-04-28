var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpRename = require('gulp-rename');
var path = require('path');
var util = require('util');
// var stream = require('stream');

var excludes = ['!node_modules', '!node_modules/**', '!.desktop', '!.desktop/**'];

gulp.task('js-common', function() { // 
    return gulp.src(excludes.concat(['**/[^_]*!(.android|.desktop).js'])).pipe(gulpBabel({
        presets: ['es2015', 'react']
    })).pipe(gulp.dest('.desktop'));
});
gulp.task('js-desktop', function() { // 
    return gulp.src('**/*.desktop.js').pipe(gulpBabel({
        presets: ['es2015', 'react']
    })).pipe(gulpRename(function (path) {
        path.basename = path.basename.substr(0, path.basename.length-8);
    })).pipe(gulp.dest('.desktop/'));
});
gulp.task('html', function() { // 
    return gulp.src(excludes.concat(['**/*.html'])).pipe(gulp.dest('.desktop/'));
});

gulp.task('js', ['js-common', 'js-desktop', 'html']);
gulp.task('dist', ['js']);
gulp.task('default', ['js'], function() {
    gulp.watch(excludes.concat(['**/*.js', '**/*.html']), ['js']);
});

