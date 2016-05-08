var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpRename = require('gulp-rename');
var path = require('path');
var util = require('util');
// var stream = require('stream');

gulp.task('js-common', function() { //
    return gulp.src('app/**/[^_]*!(.android|.desktop).js').pipe(gulpBabel({
        presets: ['es2015', 'react'],
        plugins: ["syntax-async-functions", "transform-regenerator"]
    })).pipe(gulp.dest('.desktop/'));
});
gulp.task('js-desktop', function() { //
    return gulp.src('app/**/*.desktop.js').pipe(gulpBabel({
        presets: ['es2015', 'react'],
        plugins: ["syntax-async-functions", "transform-regenerator"]
    })).pipe(gulpRename(function (path) {
        path.basename = path.basename.substr(0, path.basename.length-8);
    })).pipe(gulp.dest('.desktop/'));
});
gulp.task('html', function() { //
    return gulp.src('app/**/*.html').pipe(gulp.dest('.desktop/'));
});

gulp.task('js', ['js-common', 'js-desktop', 'html']);
gulp.task('dist', ['js']);
gulp.task('default', ['js'], function() {
    gulp.watch(['app/**/*.js', 'app/**/*.html'], ['js']);
});
