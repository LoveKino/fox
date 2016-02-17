/**
 * 处理 html 页面
 */
var gulp  = require('gulp'),
    gutil = require('gulp-util');

var common = require('../common');
var projectConf = common.readConfig();
var flag = common.getFlag();

gulp.task('html', ['pack'], function () {
    var replace = require('gulp-replace');
    var htmlmin = require('gulp-htmlmin');
    var gulpif = require('gulp-if');

    var htmlFiles = ['src/page/**/*.html'];

    gutil.log('[#处理页面]:', htmlFiles.join(','));

    return gulp
        .src(htmlFiles)
        .pipe(gulpif(!flag.enableDebug, replace(
            /\.\.\/\.\.\/script\/(.+)\.js/g,
            '../../script/$1.min.js'
        )))
        .pipe(replace(
            /\<%TITLE%\>/g,
            projectConf.name
        ))
        .pipe(replace(
            /\<%RUN_MODE%\>/g,
            flag.isProduction && !flag.enableDebug ? 'PRODUCTION': 'DEVELOPMENT'
        ))
        .pipe(gulpif(!flag.enableDebug, htmlmin({
            collapseWhitespace : true,
            removeComments     : true
        })))
        .pipe(gulp.dest('dist/page/'));
});