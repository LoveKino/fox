/**
 * 清理项目输出目录
 */
var gulp  = require('gulp'),
    gutil = require('gulp-util');

gulp.task('clean', function () {
    var dirPath = ['dist'];
    var clean = require('gulp-clean');

    gutil.log('[#清理目录]:', dirPath.join(', '));
    return gulp.src(dirPath, {read : true}).pipe(clean());
});