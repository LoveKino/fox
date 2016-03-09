/** 行为记录 **/
var Recorder = require('../../general/background/recorder');
/** 插件工具栏图标 **/
var browserIcon = require('../../common/browser-icon');
var Extension = require('../../common/extension');
/** 插件工具栏图标动画 **/
var recordAnimation = require('../../general/background/icon-animation');
/** 数据统计 **/
//var analytics = require('../../general/background/analytics');
/** 处理chrome网络请求 **/
/** 帮助函数 **/
//var helper = require('helper');
/** 格式处理 **/
var vsprintf = require('format').vsprintf;
/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[background/main]';
/** 数据储存 **/
var localForage = require('localforage');
var DataBus = localForage.createInstance(
    {
        driver      : localForage.INDEXEDDB,
        name        : 'background',
        storeName   : 'default',
        description : 'background暂存数据库。'
    }
);
/** 解析动作 **/
//var actionParser = require('../../general/background/parse-action');
/** 消息处理 **/
//var message = require('../../common/message');
/** 知识库 **/
var knowledge = require('../../general/background/knowledge.js');
/** 网络请求库 **/
var HttpNetwork = require('../../general/background/http-network.js');
/** NETWORK UTIL **/
var Network = require('network');
/** local user data method for popup **/
var User = require('../../general/popup/user');

/**
 * Record request headers filter by accept mine-type
 * @param details
 * @returns {{requestHeaders: headers}}
 */
function processRequestHeaders (details) {
    var headers = details.requestHeaders;
    DataBus.getItem('state#' + details.tabId, headerHandle);

    function headerHandle (tabRecordState) {
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
                            Debug.warn(vsprintf('%s 储存当前标签页:[%s]的HTTP请求头', [debugModuleName, details.tabId]));
                            DataBus.setItem('headers#' + details.tabId, {'headers' : headers});
                            // per request only contain one accept item
                            break;
                        }
                    }
                }
                // 不对请求头做任何修改
                return {'requestHeaders' : headers};
        }
    }
}

/**
 * 检查是否为标准的HTTP协议地址
 * @param url
 * @returns {boolean}
 */
function isStandardUrl (url) {
    return url.indexOf('http://') === 0 || url.indexOf('https://') === 0;
}


function syncCaseData (data, tabId, sender) {
    var userData = User.getUserData();
    var user = userData.user;
    var pass = userData.pass;

    if (!(user && pass)) {
        Debug.warn(vsprintf('%s 用户尚未登录，使用单机模式。', [debugModuleName]));
        return;
    }
    // request api to save case
    Network.request('saveCase', null, {
        user : user,
        pass : pass,
        data : data
    }, function (resp) {
        if (resp && resp.status === 'success') {
            Debug.info(debugModuleName, 'case to server success');
            sender.postMessage({'state' : 'SYNC-READY'});
            DataBus.setItem('sync-state#' + tabId, 'success');
        }
    }, function (resp) {
        Debug.info(debugModuleName, 'case to server fail', resp);
        sender.postMessage({'state' : 'SYNC-FAILED'});
        DataBus.setItem('sync-state#' + tabId, 'fail');
    }, {contentType : 'application/json'});
}


document.addEventListener('DOMContentLoaded', function () {
    Debug.info(vsprintf('%s 插件尝试启动。', [debugModuleName]));
    browserIcon.updateIcon();
    /**
     * @param params
     */
    function process (params) {
        /**
         * 清除动画
         * @notice 仅当传递参数包含录制动画时
         */
        function stopAnimation () {
            if (params.showRecordingAnimation) {
                Debug.log(vsprintf('%s 插件图标栏动画展示结束。', [debugModuleName]));
                recordAnimation.stop();
            }
        }

        if (params.showRecordingAnimation) {
            Debug.log(vsprintf('%s 插件图标栏动画展示开始。', [debugModuleName]));
            recordAnimation.start();
        }

        setTimeout(function () {
            browserIcon.updateIcon();
            stopAnimation();
        }, 2000);
    }

    browserIcon.stop();
    process({initPlugin : true, showRecordingAnimation : true});

    var canvas = document.getElementById('canvas');
    var iconReload = document.getElementById('icon-reload');
    if (canvas && iconReload) {
        browserIcon.flip(canvas, iconReload);
    } else {
        Debug.error('onInit: lose canvas elem or reload icon.');
    }

    try {
        /**
         * 注册长连接给插件不同页面之间使用
         */
        chrome.runtime.onConnect.addListener(function (port) {
            Debug.info(debugModuleName, '插件通信端口连接成功:', port);
            if (port.name === 'background') {
                port.onMessage.addListener(function (response) {
                    if (Extension.checkUrlIsInternal(port.sender.url)) {
                        Debug.info(debugModuleName, '来自内部的消息', Extension.getNameByPath(port.sender.url), response);
                        Debug.info('!!!', response.popup, '!!!');
                        switch (response.popup) {
                            case 'init':
                                break;
                            case 'shown':
                                DataBus.removeItem('records#' + response.id);
                                break;
                            case 'start':
                                Recorder.start({
                                    'id'     : response.tabId,
                                    'width'  : response.width,
                                    'height' : response.height,
                                    'url'    : response.url
                                });
                                Recorder.add('record::start', [new Date - 0], 'head');
                                port.postMessage({'state' : 'started'});
                                DataBus.removeItem('records#' + response.tabId);
                                break;
                            case 'stop':
                                Recorder.add('record::finish', [new Date - 0], 'head');
                                DataBus.setItem('records#' + response.tabId, Recorder.records);
                                DataBus.removeItem('state#' + response.tabId);
                                //DataBus.setItem('state#' + response.tabId, 'stopped');
                                Recorder.reset();
                                port.postMessage({'state' : 'stop'});
                                syncCaseData(Recorder.records, response.tabId, port);
                                break;
                        }
                    } else {
                        Debug.warn(debugModuleName, '来自外部的消息', Extension.getNameByPath(port.sender.url), response);
                    }
                });
            }
        });

        /**
         * 分别给不同的Tab设置弹出窗内容
         * @param tab
         * @param behaviourCount
         */
        var setPopupDetail = function (tab, behaviourCount) {
            function setPopup (tabId, popup) {
                return chrome.browserAction.setPopup({'tabId' : tabId, 'popup' : popup});
            }

            if (isStandardUrl(tab.url)) {
                setPopup(tab.id, 'page/popup/main.html');
                DataBus.setItem('info#' + tab.id, tab);
            } else {
                setPopup(tab.id, knowledge.showTopic('error', 'not-allow-page', false));
                DataBus.removeItem('info#' + tab.id);
            }
            chrome.browserAction.setBadgeText({text : behaviourCount || ''});
        };


        Debug.log(debugModuleName, '开始监听网络请求并捕获页面请求头。');
        HttpNetwork.request(processRequestHeaders);

        /**
         * 绑定标签状态更新事件
         */
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            switch (changeInfo.status) {
                case 'complete':
                    return setPopupDetail(tab);
                case 'loading':
                default :
                    return setPopupDetail(tab);
            }
        });

        /**
         * 绑定当前页面弹出窗事件
         */
        chrome.tabs.query({currentWindow : true, active : true}, function (tabs) {
            if (tabs && tabs.length) setPopupDetail(tabs[0]);
        });

        var port = chrome.runtime.connect({'from' : 'background', 'to' : '*'});
        port.postMessage({'background' : 'background ready.'});

    } catch (e) {
//        location.reload();
    }
});
