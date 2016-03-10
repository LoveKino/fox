/** debug util **/
var Debug = require('debug.js');
var debugModuleName = 'util/indexedDB';
/** 格式处理 **/
var vsprintf = require('format').vsprintf;

/**
 * 清理数据库
 */
function cleanUp () {
    if ('indexedDB' in window) {
        var db = window.indexedDB;
        try {
            db.deleteDatabase('localforage');
            db.deleteDatabase('background');
            db.deleteDatabase('user');
            db.deleteDatabase('popup');
            db.deleteDatabase('network');
        } catch (e) {
            Debug.error(vsprintf('%s 清理数据库出现错误。', [debugModuleName]));
        }
    } else {
        Debug.error(vsprintf('%s 运行环境不支持indexedDB。', [debugModuleName]));
    }
}

module.exports = {
    cleanUp : cleanUp
};