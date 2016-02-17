var gulp  = require('gulp'),
    gutil = require('gulp-util');

var flag = require('../common').getFlag();

gulp.task('build', ['html', 'manifest', 'resource', 'pack', 'lint'], function () {
    gutil.log('[#发布开关]状态:', flag.isProduction === true ? '打开': '关闭');
    gutil.log('[#调试开关]状态:', flag.enableDebug === true ? '打开': '关闭');
    gutil.log('[#检查开关]状态:', flag.enableLint === true ? '打开': '关闭');
    gutil.log('[#构建项目]完毕。');
});