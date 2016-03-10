/** 行为记录 **/
var Recorder = require('../../general/background/recorder');
/** 插件工具栏图标 **/
var browserIcon = require('../../common/browser-icon');
var Extension = require('../../common/extension');
/** 插件工具栏图标动画 **/
var recordAnimation = require('../../general/background/icon-animation');
/** 处理chrome网络请求 **/
var ChromeNetwork = require('../../general/background/http-network.js');
/** 错误处理 **/
var errorHandle = require('../../common/error-handle');
/** indexedDB操作 **/
var IndexedDB = require('../../util/indexedDB');
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
/** 知识库 **/
var knowledge = require('../../general/background/knowledge.js');
/** 网络请求库 **/
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

    function headerHandle (tabRecordState) {
        var headers = details.requestHeaders;
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
                            // async save
                            DataBus
                                .setItem('headers#' + details.tabId, {'headers' : headers})
                                .catch(errorHandle.storage);
                            // per request only contain one accept item
                            break;
                        }
                    }
                }
                // 不对请求头做任何修改
                return {'requestHeaders' : headers};
        }
    }

    DataBus
        .getItem('state#' + details.tabId)
        .then(headerHandle)
        .catch(errorHandle.storage);

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

    User.getUserData().then(function (userData) {

        Debug.warn(vsprintf('%s 获取用户数据: %s', [debugModuleName, userData]));

        var user = null;
        var pass = null;

        if (userData) {
            user = userData.user;
            pass = userData.pass;
        }

        //todo: 显示在popup上
        if (!(user && pass)) {
            Debug.warn(vsprintf('%s 用户尚未登录，使用单机模式。', [debugModuleName]));
            return sender.postMessage({'state' : 'SYNC-FAILED-WITHOUT-USER-LOGIN'});
        }

        // request api to save case
        Network.request('saveCase', null, {
            user : user,
            pass : pass,
            data : data
        }, function (resp) {
            if (resp && resp.status === 'success') {
                Debug.info(debugModuleName, 'case to server success');
                DataBus
                    .setItem('sync-state#' + tabId, 'success')
                    .then(function () {
                        return sender.postMessage({'state' : 'syncing', 'result' : 'success', 'tabId' : tabId});
                    })
                    .catch(errorHandle.storage);
            }
        }, function (resp) {
            Debug.info(debugModuleName, 'case to server fail', resp);
            DataBus
                .setItem('sync-state#' + tabId, 'fail')
                .then(function () {
                    return sender.postMessage({'state' : 'syncing', 'result' : 'failed', 'tabId' : tabId});
                })
                .catch(errorHandle.storage);
        }, {contentType : 'application/json'});

    });

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
         * 安装/重载完毕执行清理数据库操作
         */
        chrome.runtime.onInstalled.addListener(IndexedDB.cleanUp);

        /**
         * 注册长连接给插件不同页面之间使用
         */
        chrome.runtime.onConnect.addListener(function (port) {
            Debug.info(debugModuleName, '插件通信端口连接成功:', port);
            if (port.name === 'background') {
                port.onMessage.addListener(function (response) {
                    if (Extension.checkUrlIsInternal(port.sender.url)) {
                        Debug.info(debugModuleName, '来自内部的消息', Extension.getNameByPath(port.sender.url), response);
                        switch (response.popup) {
                            case 'init':
                                port.postMessage({'state' : 'know-init'});
                                break;
                            case 'shown':
                                DataBus.removeItem('records#' + response.id);
                                port.postMessage({'state' : 'know-shown'});
                                break;
                            case 'start':
                                Recorder.start({
                                    'id'     : response.tabId,
                                    'width'  : response.width,
                                    'height' : response.height,
                                    'url'    : response.url
                                });
                                Recorder.add('record::start', [new Date - 0], 'head');
                                port.postMessage({'tabId' : response.tabId, 'state' : 'recorder-started'});
                                DataBus
                                    .removeItem('records#' + response.tabId)
                                    .catch(errorHandle);
                                break;
                            case 'stop':
                                Recorder.add('record::finish', [new Date - 0], 'head');
                                DataBus
                                    .setItem('records#' + response.tabId, Recorder.records)
                                    .then(function () {
                                        Recorder.reset();
                                        return port.postMessage({
                                            'tabId' : response.tabId,
                                            'state' : 'recorder-finished'
                                        });
                                    })
                                    .catch(errorHandle);
                                break;
                            case 'sync':
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
                DataBus
                    .setItem('info#' + tab.id, tab)
                    .catch(errorHandle);
            } else {
                setPopup(tab.id, knowledge.showTopic('error', 'not-allow-page', false));
                DataBus
                    .removeItem('info#' + tab.id)
                    .catch(errorHandle);
            }
            chrome.browserAction.setBadgeText({text : behaviourCount || ''});
        };


        Debug.log(debugModuleName, '开始监听网络请求并捕获页面请求头。');
        ChromeNetwork.request(processRequestHeaders);

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

        var port = chrome.runtime.connect({'name' : 'popup'});
        port.postMessage({'background' : 'background ready.'});

    } catch (e) {

        // 出现错误，优先清理数据库
        IndexedDB.cleanUp();

        Debug.warn(debugModuleName, '插件加载出现错误，尝试自动重新加载插件。');

        // 运行时错误，尝试硬性重载环境（重新加载资源）
        window.location.reload();
    }
});
