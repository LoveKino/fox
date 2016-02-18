/** 数据统计 **/
//var analytics = require('../../general/background/analytics');
/** 处理chrome网络请求 **/
/** 帮助函数 **/
var helper = require('helper');
/** 格式处理 **/
var vsprintf = require('format').vsprintf;
/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[background/main]';
/** 知识库 **/
var knowledge = require('../../general/background/knowledge.js');

function checkCurrentTabisCorrect (tab) {
    return helper.isStandardLink(tab.url, ['http', 'https']);
}

try {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'loading') {
            Debug.info(debugModuleName, '插件尝试启动。');
            chrome.pageAction.show(tab.id);

            Debug.info(tabId, changeInfo, tab);

            if (checkCurrentTabisCorrect(tab)) {
                Debug.info(debugModuleName, '插件主动展示插件栏弹出窗。');
                chrome.pageAction.setPopup({'tabId' : tab.id, 'popup' : 'page/popup/main.html'});
                Debug.info(debugModuleName, vsprintf('当前选择的选项卡为: %s。', [tab]));
                Debug.info(debugModuleName, '当前插件ID:', chrome.runtime.id);
            } else {
                if (tab.url.indexOf('chrome-extension://' + chrome.runtime.id) !== 0) {
                    chrome.pageAction.setPopup({
                        'tabId' : tab.id,
                        'popup' : knowledge.showTopic('error', 'not-allow-page')
                    });
                } else {
                    chrome.pageAction.hide(tab.id);
                }
            }

        }
    });
} catch (e) {
    Debug.error('插件加载出现错误，正在重载。', e);
    location.reload();
}
