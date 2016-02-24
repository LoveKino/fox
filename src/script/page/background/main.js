/** 数据统计 **/
//var analytics = require('../../general/background/analytics');
/** 处理chrome网络请求 **/
/** 帮助函数 **/
var helper = require('helper');
/** 格式处理 **/
var vsprintf = require('format').vsprintf;
/** 数据储存 **/
var Data = require('data');
/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[background/main]';
/** 知识库 **/
var knowledge = require('../../general/background/knowledge.js');
/** 网络请求库 **/
var HttpNetwork = require('../../general/background/http-network.js');


function checkCurrentTabIsCorrect (tab) {
    return helper.isStandardLink(tab.url, ['http', 'https']);
}

/**
 * Record request headers filter by accept mine-type
 * @param details
 * @returns {{requestHeaders: headers}}
 */
function processRequestHeaders (details) {
    var headers = details.requestHeaders;
    var tabRecordState = Data.load('state', details.tabId);

    /**
     * 事件触发顺序:
     *      chrome.webRequest.onBeforeSendHeaders => chrome.tabs.onUpdated
     * 故想获取欲录制的标签页第一页的信息，需要判断当前标签页状态是否为:
     *  - 未录制过，localStorage 为空
     *  - 已录制且录制完毕，localStorage记录为stopped
     */

    switch (tabRecordState) {
        case 'started':
            // 开始录制的请求，可配置修改请求头
            return {'requestHeaders' : headers};
        case 'stopped':
        default :
            for (var i = 0, j = headers.length; i < j; i++) {
                if (headers[i].name.toLowerCase() === 'accept') {
                    var value = headers[i].value.toLowerCase();
                    if (value.indexOf('text/html') > -1 || value.indexOf('application/xml') > -1 || value.indexOf('application/xhtml') > -1) {
                        //record current tab request headers
                        Debug.warn(debugModuleName, '储存当前标签页HTTP请求头');
                        Data.save('headers', {'headers' : headers}, details.tabId);
                        // per request only contain one accept item
                        break;
                    }
                }
            }
            // 不对请求头做任何修改
            return {'requestHeaders' : headers};
    }
}


try {
    Debug.log(debugModuleName, '开始监听网络请求并捕获页面请求头。');
    HttpNetwork.request(processRequestHeaders);

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        switch (changeInfo.status) {
            case 'loading':
                Debug.info(debugModuleName, '浏览器标签未初始化完毕时初始化插件图标。');
                chrome.pageAction.show(tab.id);
                if (checkCurrentTabIsCorrect(tab)) {
                    Debug.info(debugModuleName, '插件主动展示插件栏弹出窗。');
                    chrome.pageAction.setPopup({'tabId' : tab.id, 'popup' : 'page/popup/main.html'});
                    Debug.info(debugModuleName, vsprintf('当前选择的选项卡为: %s。', [tab]));
                    Debug.info(debugModuleName, '当前插件ID:', chrome.runtime.id);
                    Data.save('info', tab, tab.id);
                } else {
                    if (tab.url.indexOf('chrome-extension://' + chrome.runtime.id) !== 0) {
                        chrome.pageAction.setPopup({
                            'tabId' : tab.id,
                            'popup' : knowledge.showTopic('error', 'not-allow-page')
                        });
                    } else {
                        chrome.pageAction.hide(tab.id);
                    }
                    Data.clear('info', tab.id);
                }
                break;
            case 'complete':
                Debug.info(debugModuleName, '标签完成更新。', Data.load('headers', tab.id));
                break;
            default :
                break;
        }
    });
} catch (e) {
    Debug.error('插件加载出现错误，正在重载。', e);
    location.reload();
}
