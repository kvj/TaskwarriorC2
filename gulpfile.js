var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpRename = require('gulp-rename');
var path = require('path');
var util = require('util');
// var stream = require('stream');

var babelPresets = ['es2015', 'react'];
var babelPlugins = ['syntax-async-functions', 'transform-regenerator'];

gulp.task('js-common', function() { //
    return gulp.src('app/**/*!(.android|.desktop).js').pipe(gulpBabel({
        presets: babelPresets,
        plugins: babelPlugins
    })).pipe(gulp.dest('.desktop/'));
});
gulp.task('js-desktop', function() { //
    return gulp.src('app/**/*.desktop.js').pipe(gulpBabel({
        presets: babelPresets,
        plugins: babelPlugins
    })).pipe(gulpRename(function (path) {
        path.basename = path.basename.substr(0, path.basename.length-8);
    })).pipe(gulp.dest('.desktop/'));
});

gulp.task('js', ['js-common', 'js-desktop']);
gulp.task('dist', ['js']);
gulp.task('default', ['js'], function() {
    gulp.watch('app/**/*.js', ['js']);
});
