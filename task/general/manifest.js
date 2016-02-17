/**
 * 处理 manifest
 */

var gulp  = require('gulp'),
    gutil = require('gulp-util');

var common = require('../common');
var projectConf = common.readConfig();
var appendMinExt = common.appendMinExt;
var flag = common.getFlag();

gulp.task('manifest', function () {
    var jsoncombine = require('gulp-jsoncombine');
    var confFiles = 'src/conf/manifest.json';

    gutil.log('[#处理配置]:', confFiles);
    return gulp.src(confFiles)
        .pipe(jsoncombine('manifest.json', function (file) {
            var content = file.manifest;
            if (flag.isProduction && !flag.enableDebug) {
                if (content.background.scripts) {
                    content.background.scripts = content.background.scripts.map(function (fileName) {
                        return appendMinExt(fileName);
                    });
                }
            }

            content.name = projectConf.name + (flag.isProduction ? '': ' [开发模式]');
            content.description = projectConf.description;
            content.browser_action.default_title = projectConf.name;
            content.homepage_url = projectConf.homepage;
            content.author = projectConf.author;
            content.version = projectConf.version;
            return new Buffer(JSON.stringify(content));
        }))
        .pipe(gulp.dest('./dist'));
});
