/**
 * 使用 webpack 进行打包
 */

var gulp  = require('gulp'),
    gutil = require('gulp-util');

var common = require('../common');
var projectConf = common.readConfig();
var appendMinExt = common.appendMinExt;
var flag = common.getFlag();

gulp.task('pack', ['lint'], function (done) {
    var webpack = require('webpack');
    var gutil = require('gulp-util');
    var concat = require('gulp-concat');
    var webpackConf = require('../webpack.config')({debug : !!flag.enableDebug});

    gutil.log('[#打包配置]:', JSON.stringify(webpackConf));

    webpack(webpackConf, function (err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[#打包结果]', stats.toString({colors : true}));

        gutil.log('[#后续处理]');

        var prepareFiles = ['dist/script/vendor.js', 'dist/script/inject.js'];
        var concatName = 'inject.js';

        if (flag.isProduction && !flag.enableDebug) {
            prepareFiles = prepareFiles.map(function (fileName) {
                return appendMinExt(fileName);
            });
            concatName = appendMinExt(concatName);
        }

        gulp.src(prepareFiles)
            .pipe(concat(concatName))
            .pipe(gulp.dest('dist/script'));
        done();
    });
});