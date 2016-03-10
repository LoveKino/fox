var Config = require('config');

/** debug util **/
//var Debug = require('debug.js');
//var debugModuleName = '[common/extension]';

var pageList = Config.PAGE_LIST;
var runtimeId = chrome.runtime.id;

var extensionProtocol = 'chrome-extension://';
var extensionHost = extensionProtocol + chrome.runtime.id;

/**
 * 根据页面路径获取页面名称
 * @param name
 * @returns {*}
 */
function getPathByName (name) {
    var path = pageList[name];
    return path ? path: false;
}

/**
 * 根据页面名称获取页面路径
 * @param path
 * @returns {*}
 */
function getNameByPath (path) {
    if (path.indexOf(extensionHost) === 0) {
        path = path.slice(extensionHost.length);
    }
    for (var page in pageList) {
        if (pageList.hasOwnProperty(page)) {
            var index = pageList[page].lastIndexOf(path);
            if (index === -1) return false;
            if (index + path.length === pageList[page].length) return page;
        }
    }
    return false;
}

/**
 * 判断链接是否为内容页面
 * @param url
 * @returns {boolean}
 */
var checkUrlIsInternal = function (url) {
    var relativePath = url.split(extensionHost);
    if (relativePath.length === 2) {
        relativePath = relativePath[1];
    } else {
        return false;
    }
    return Object.keys(pageList).map(function (name) {return pageList[name];}).indexOf(relativePath) > -1;
};

module.exports = {
    host               : extensionHost,
    id                 : runtimeId,
    getNameByPath      : getNameByPath,
    getPathByName      : getPathByName,
    checkUrlIsInternal : checkUrlIsInternal
};