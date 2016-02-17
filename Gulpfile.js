/**
 * 默认构建脚本入口文件
 */

var gulp  = require('gulp'),
    gutil = require('gulp-util');

require('require-dir')('./task/general');

/**
 * 默认显示帮助信息
 */
gulp.task('default', function () {
    var common = require('./task/common');
    var projectConf = common.readConfig();

    gutil.log(['当前项目版本:', projectConf.version].join(' '));
    common.hereDoc(function () {/*!
         支持命令:

         $ gulp             => 查看帮助文档
         $ gulp -h          => 查看帮助文档

         $ gulp build       => 构建项目代码
         $ gulp clean       => 清理构建目录
         $ gulp dev         => 启动开发模式(UNDER BUILDING)
         $ gulp help        => 查看帮助文档
         $ gulp html        => 构建项目模板
         $ gulp lint        => 执行代码检查
         $ gulp manifest    => 生成插件配置文件
         $ gulp pack        => 打包项目代码
         $ gulp resource    => 复制图片等资源
         $ gulp test        => 执行代码测试(UNDER BUILDING)

         */
    }, true);
});