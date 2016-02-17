/**
 * 启动开发模式
 */
var gulp  = require('gulp'),
    gutil = require('gulp-util');

gulp.task('dev', function () {
    gutil.log('[#启动开发模式]:');
    return gulp;
});