/**
 * 统计模块
 */

var uuid = require('random').fakeUUID;
var data = require('data');
var debug = require('debug.js');
var debugModuleName = '[background/analytics]';


/** 插件安装时间 **/
var KEY_INSTALL_TIME = 'installTime';
if (!data.get(KEY_INSTALL_TIME)) {
    data.set(KEY_INSTALL_TIME, Date.now());
    data.save();
}

/** 用户识别 **/
var KEY_USER_ID = 'uid';
if (!data.get(KEY_USER_ID)) {
    data.set(KEY_USER_ID, uuid());
    data.save();
}

/** 统计行为 **/
function track () {
    debug.info(debugModuleName, '统计参数:', arguments);
}

module.exports = {
    track : track
};