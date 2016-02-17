/**
 * 行为记录模块
 */

/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[background/recorder]';

var helper = require('helper');

/** http network util **/
var HttpNetwork = require('./http-network');


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
 * 注入脚本的Option
 * @type {{currentWindow: boolean, active: boolean}}
 */
var injectOption = {currentWindow : true, active : true};


/**
 * 全局保存的用户行为
 * @type {Array}
 */
var actionRecords = [];


var curActiveTab = null;

/**
 * 页面注入脚本
 * @param tabs
 * @param injectFile
 */
function injectScript (tabs, injectFile) {
    var targetTab = tabs[0];
    if (helper.isStandardLink(targetTab.url, ['http', 'https'])) {
        // record current tab viewport size
        record(actionWrapper('BROWSER::CMD', 'set-viewport', {
            'width'  : targetTab.width,
            'height' : targetTab.height,
            'url'    : targetTab.url
        }));
        chrome.tabs.executeScript(targetTab.id, {file : injectFile});
    } else {
        Debug.error(debugModuleName, '插件不支持i运行在非标准页面下。');
    }
}


function processRequestHeaders (details) {
    var headers = details.requestHeaders;
    if (details.tabId === curActiveTab.id) {
        Debug.info(details, curActiveTab);

        for (var i = 0, j = headers.length; i < j; i++) {
            if (headers[i].name.toLowerCase() === 'accept') {
                var value = headers[i].value.toLowerCase();
                if (value.indexOf('text/html') > -1 || value.indexOf('application/xml') > -1 || value.indexOf('application/xhtml') > -1) {
                    // record current tab request headers
                    record(actionWrapper('BROWSER::CMD', 'send-request-headers', {
                        'headers' : details.requestHeaders,
                        'url'     : curActiveTab.url
                    }));
                    // per request only contain one accept item
                    break;
                }
            }
        }
    }
    return {'requestHeaders' : headers};
}

function recordHeaders (tabs) {

    var tab = null;
    for (var item in tabs) {
        if (tabs.hasOwnProperty(item) && tabs[item] && tabs[item].selected) {
            tab = tabs[item];
            break;
        }
    }

    if (tab === null) {
        return;
    }

    curActiveTab = tab;

    HttpNetwork.request(processRequestHeaders);
}

/**
 * 记录行为消息
 *
 * @param action
 */
function record (action) {

    Debug.log(debugModuleName, '接收页面记录到的行为:', action);

    var lastAction = actionRecords[actionRecords.length - 1];
    if (!lastAction) {
        return actionRecords.push(action);
    } else {
        if (lastAction === action) {
            return;
        }
        actionRecords.push(action);
    }
}


function injectPluginActionRecord (name, action, option) {
    Debug.log(debugModuleName, '主动插入记录:', action);
    var item = actionWrapper('PLUGIN::CMD', name, action);
    if (option === 'head') {
        actionRecords.unshift(item);
    } else {
        actionRecords.push(item);
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


function detectScreenshots (command) {
    if (command === 'detect-screenshot') record(actionWrapper('SYSTEM::CMD', 'screenshot', {'fileName' : 'index.png'}));
}


function detectUrl (details) {
    var type = details.transitionType;
    var from = details.transitionQualifiers;
    var action = '';

    switch (type) {
        case 'reload':
            if (!actionRecords.length) {
                action = record(actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            } else {
                action = record(actionWrapper('BROWSER::CMD', 'reload', {'url' : details.url}));
            }
            break;
        case 'typed':
            if (!from.length ||
                from[0] === 'from_address_bar' ||
                from[0] === 'server_redirect' && from[1] === 'from_address_bar'
            ) {
                action = record(actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            }
            break;
        case 'auto_bookmark':
            action = record(actionWrapper('BROWSER::CMD', 'open', {'url' : details.url}));
            break;
    }

    return action;
}


function injectEventScript () {
    chrome.tabs.query(injectOption, function (tabs) {
        if (tabs && tabs.length) {
            injectScript(tabs, injectFile);
            Debug.log(debugModuleName, '插入录制脚本到选项卡：', tabs);
            recordHeaders(tabs);
        }
    });
}

function detectEvents (tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.query(injectOption, function (tabs) {
            if (tabs && tabs.length && tabId === tabs[0].id) {
                injectScript(tabs, injectFile);
                recordHeaders(tabs);
            }
        });
    }
}

function reset () {
    chrome.commands.onCommand.removeListener(detectScreenshots);
    chrome.webNavigation.onCommitted.removeListener(detectUrl);
    chrome.tabs.onUpdated.removeListener(detectEvents);
    chrome.runtime.onMessage.removeListener(record);

    HttpNetwork.resetHandle('request', processRequestHeaders);
}

module.exports = {
    start   : function () {
        chrome.commands.onCommand.addListener(detectScreenshots);
        chrome.webNavigation.onCommitted.addListener(detectUrl);
        injectEventScript();
        chrome.tabs.onUpdated.addListener(detectEvents);
        chrome.runtime.onMessage.addListener(record);
        recordHeaders();
    },
    reset   : reset,
    records : actionRecords,
    add     : injectPluginActionRecord
};