/**
 * 处理媒体资源
 */
var gulp  = require('gulp'),
    gutil = require('gulp-util');

gulp.task('resource', function () {
    var gulpCopy = require('gulp-copy');

    gutil.log('[#复制资源]:');
    return gulp.src(['./src/image/**/*'])
        .pipe(gulpCopy('dist/', {prefix : 1}));
});