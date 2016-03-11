/**
 * 行为记录模块
 */

/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[background/recorder]';
/** helper util **/
var helper = require('helper');


/**
 * 当前程序运行模式
 * @type {string}
 */
var runMode = document.querySelector('html').getAttribute('data-run-mode');


/**
 * 要注入页面的脚本
 * @type {string}
 */
var injectFile = runMode === 'PRODUCTION' ? '/script/inject.min.js': '/script/inject.js';


/**
 * 全局保存的用户行为
 * @type {{}}
 * @desc {tabId:[actionList]}
 */
var actionRecords = {};


/**
 * 记录行为消息
 * @param tabId
 * @param action
 * @returns {boolean}
 */
function record (tabId, action) {

    if (helper.is.array(tabId) && tabId.length === 2) {
        action = tabId[1];
        tabId = tabId[0];
    }

    Debug.error(debugModuleName, '接收页面记录到的行为:', tabId, action);

    if (actionRecords.hasOwnProperty(tabId)) {
        Debug.warn(debugModuleName, '有当前tabId属性:', actionRecords[tabId]);
    } else {
        actionRecords[tabId] = [];
        Debug.warn(debugModuleName, '创建tabId队列:', actionRecords[tabId]);
    }

    if (actionRecords[tabId].length) {
        var last = actionRecords[tabId][actionRecords[tabId].length - 1];
        if (last === action) {
            return false;
        }
    }

    actionRecords[tabId].push(action);
}


/**
 * 获取当前录制的行为列表
 * @param tabId
 * @returns {*}
 */
function getData (tabId) {
    if (actionRecords.hasOwnProperty(tabId)) {
        return actionRecords[tabId];
    } else {
        return false;
    }
}


/**
 * 向事件队列手动插入行为
 * @param tabId
 * @param name
 * @param action
 * @param option
 */
function injectPluginActionRecord (tabId, name, action, option) {
    if (!actionRecords.hasOwnProperty(tabId)) {
        actionRecords[tabId] = [];
    }
    Debug.log(debugModuleName, '主动插入记录:', action);
    var item = actionWrapper('PLUGIN::CMD', name, action);
    if (option === 'head') {
        actionRecords[tabId].unshift(item);
    } else {
        actionRecords[tabId].push(item);
    }
}


function actionWrapper (eventGroup, eventType, data) {
    var result = {
        type      : eventType,
        category  : eventGroup,
        timestamp : (new Date - 0)
    };

    if (data) {
        result.data = data;
    }

    return result;
}


function detectUrl (details) {
    var type = details.transitionType;
    var from = details.transitionQualifiers;
    var action = '';

    Debug.error(details);
    switch (type) {
        case 'reload':
            if (!actionRecords.length) {
                action = record(details.tabId, actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            } else {
                action = record(details.tabId, actionWrapper('BROWSER::CMD', 'reload', {'url' : details.url}));
            }
            break;
        case 'typed':
            if (!from.length ||
                from[0] === 'from_address_bar' ||
                from[0] === 'server_redirect' && from[1] === 'from_address_bar'
            ) {
                action = record(details.tabId, actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            }
            break;
        case 'auto_bookmark':
            action = record(details.tabId, actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            break;
    }

    return action;
}


/**
 * 页面注入监听事件脚本
 * @param tab
 */
function injectEventScript (tab) {
    Debug.log(debugModuleName, '插入录制脚本到选项卡：', tab);

    if (helper.isStandardLink(tab.url, ['http', 'https'])) {
        // record current tab viewport size
        record(tab.id, actionWrapper('BROWSER::CMD', 'set-viewport', {
            'width'  : tab.width,
            'height' : tab.height,
            'url'    : tab.url
        }));

        chrome.tabs.executeScript(tab.id, {code : 'window.__fox__tabId = ' + tab.id + ';'});
        chrome.tabs.executeScript(tab.id, {file : injectFile});
    } else {
        Debug.error(debugModuleName, '插件不支持运行在非标准页面下。');
    }
}


function startRecord (tab) {
    chrome.webNavigation.onCommitted.addListener(detectUrl);
    // @notice:插入脚本后会触发消息通信，故置于onMessage前
    injectEventScript(tab);
    chrome.runtime.onMessage.addListener(record);
}


function resetRecord () {
    chrome.webNavigation.onCommitted.removeListener(detectUrl);
    chrome.runtime.onMessage.removeListener(record);
}


module.exports = {
    start   : startRecord,
    reset   : resetRecord,
    //TODO:REMOVE
    records : actionRecords,
    add     : injectPluginActionRecord,
    getData : getData
};