/**
 * 检查代码
 */

var gulp  = require('gulp'),
    gutil = require('gulp-util');


var common = require('../common');
var projectConf = common.readConfig();
var flag = common.getFlag();


gulp.task('lint', function () {
    // return gulp;
    if (flag.isProduction || flag.enableLint) {
        var eslint = require('gulp-eslint');
        var lintFiles = [
            'src/script/**/*.js',
            '*.js',
            '!src/script/lib/*.js',
            '!node_modules/**'];

        gutil.log('[#检查代码]:', lintFiles.join(', '));
        gutil.log('[#检查配置]:', JSON.stringify(projectConf.eslintConfig));

        return gulp.src(lintFiles)
            .pipe(eslint(projectConf))
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    } else {
        return gulp;
    }
});