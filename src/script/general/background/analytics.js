/**
 * 统计模块
 * @deprecated
 * @todo refactor
 */
var uuid = require('random').fakeUUID;
var Data = require('data')('analytics');
var Debug = require('debug.js');
var debugModuleName = '[background/analytics]';

/** 插件安装时间 **/
var KEY_INSTALL_TIME = 'installTime';

Data.getItem(KEY_INSTALL_TIME)
    .then(function (value) {
        if (!value) {
            Data.setItem(KEY_INSTALL_TIME, Date.now());
        }
    }, function (error) {
        Debug.error(debugModuleName, '记录安装时间失败', error);
    });

/** 用户识别 **/
var KEY_USER_ID = 'uid';

Data.getItem(KEY_INSTALL_TIME)
    .then(function (value) {
        if (!value) {
            Data.setItem(KEY_USER_ID, uuid());
        }
    }, function (error) {
        Debug.error(debugModuleName, '记录用户UID失败', error);
    });

/** 统计行为 **/
function track () {
    Debug.info(debugModuleName, '统计参数:', arguments);
}

module.exports = {
    track : track
};