/** the style of popup page. **/
require('../../../style/page/popup/main.less');

var Extension = require('../../common/extension');

/** data util **/
var localForage = require('localforage');
var DataBus = localForage.createInstance(
    {
        driver      : localForage.INDEXEDDB,
        name        : 'popup',
        storeName   : 'default',
        description : 'popup暂存数据库。'
    }
);
/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/main]';
/** 格式处理 **/
var vsprintf = require('format').vsprintf;

var container = $('.view-controls');
var heart = $('#heart');

var errorHandle = require('../../common/error-handle');

var portBackground = chrome.runtime.connect({'name' : 'background'});

/**
 * 处理background回复消息
 */
portBackground.onMessage.addListener(function (response) {
    Debug.log(debugModuleName, 'background.js返回内容:', response);
    switch (response.state) {
        case 'know-shown':
            adjustState({'id' : response.tabId});
            break;
        case 'recorder-started':
            Debug.log(debugModuleName, '收到BG开始录制消息。');
            DataBus
                .setItem('state#' + response.tabId, 'started')
                .then(function () {
                    // @notice 因新录制需要重启页面，inject脚本响应停止事件可选
                    Debug.log(debugModuleName, '向inject.js发送开始消息。');
                    return sendMessage({'id' : response.tabId}, {'APP:MSG' : 'START-RECORD'}, function (response) {
                        Debug.info(debugModuleName, 'inject.js响应内容:', response);
                        window.close();// && setTimeout(function () {adjustState(targetTab);}, 1000);
                    });
                })
                .catch(errorHandle.storage);
            break;
        case 'recorder-finished':
            Debug.log(debugModuleName, '向inject.js发送停止消息。');
            sendMessage({'id' : response.tabId}, {'APP:MSG' : 'STOP-RECORD'}, function (response) {
                Debug.info(debugModuleName, 'inject.js响应内容:', response);
            });
            DataBus
                .setItem('state#' + response.tabId, 'finished')
                .then(function () {return adjustState({'id' : response.tabId});})
                .catch(errorHandle);
            break;
        case 'syncing':
            DataBus
                .setItem('state#' + response.tabId, 'syncing')
                .then(DataBus.setItem('sync#' + response.tabId, response.result))
                .then(function () {
                    return adjustState({'id' : response.tabId});
                })
                .catch(errorHandle);
            break;
        default :
            Debug.warn('BG未准备好录制事件。');
            break;
    }
});

portBackground.postMessage({'popup' : 'init'});


/**
 * Get current tab info
 * @param success
 * @param fail
 */
function currentTab (success, fail) {
    chrome.tabs.query({currentWindow : true, active : true}, function (tabs) {
        if (tabs && tabs.length) {
            return success(tabs[0]);
        } else {
            return fail();
        }
    });
}


/**
 * Send message to inject script
 * @param tab
 * @param data
 * @param callback
 */
function sendMessage (tab, data, callback) {
    chrome.tabs.sendMessage(tab.id, data, callback ? callback: function () {});
}

/**
 * Adjust popup view state
 */
function adjustState (tab) {
    DataBus
        .getItem('state#' + tab.id)
        .then(process)
        .catch(errorHandle.storage);

    function process (state) {
        Debug.info(debugModuleName, '调整状态, 当前状况:', state);
        switch (state) {
            case 'started':
                heart.removeClass('slow-beat').addClass('fast-beat').fadeIn();
                container.addClass('is-started');
                container.removeClass('is-initialized is-finished is-sync');
                break;
            case 'finished':
                heart.removeClass('fast-beat').addClass('slow-beat').fadeIn();
                container.addClass('is-finished');
                container.removeClass('is-initialized is-started is-sync');
                break;
            case 'syncing':
                container.addClass('is-sync');
                container.removeClass('is-initialized is-started is-finished');

                heart.remove();
                $('#sync-data').fadeIn();

                DataBus
                    .getItem('sync#' + tab.id)
                    .then(function (result) {
                        var btnSync = $('.btn-sync');
                        switch (result) {
                            case 'success':
                                DataBus.setItem('sync#' + tab.id, 'success');
                                btnSync.text('传输数据完毕');
                                break;
                            case 'failed':
                                DataBus.setItem('sync#' + tab.id, 'failed');
                                btnSync.text('传输数据失败');
                                break;
                            default :
                                btnSync.text('传输数据中...');
                                break;
                        }
                    });
                break;
            case 'error':
                break;
            default :
                heart.removeClass('fast-beat').addClass('slow-beat').fadeIn();
                container.addClass('is-initialized');
                container.removeClass('is-started is-finished is-sync');
                break;
        }
    }
}


function init (targetTab) {

    var btnStart = $('.btn-start');

    btnStart.off('click').on('click', function (e) {
        e.preventDefault();
        Debug.log(debugModuleName, '用户点击停开始按钮，通知background.js');
        portBackground.postMessage({
            'popup'  : 'start',
            'tabId'  : targetTab.id,
            'width'  : targetTab.width,
            'height' : targetTab.height,
            'url'    : targetTab.url
        });
    });

    var btnStop = $('.btn-stop');

    btnStop.off('click').on('click', function (e) {
        e.preventDefault();
        Debug.log(debugModuleName, '用户点击停止按钮，通知background.js');
        portBackground.postMessage({'popup' : 'stop', 'tabId' : targetTab.id});
    });

    var btnBeginSync = $('.btn-begin-sync');

    btnBeginSync.off('click').on('click', function (e) {
        e.preventDefault();
        Debug.log(debugModuleName, '用户点击开始同步按钮，通知background.js。');
        portBackground.postMessage({'popup' : 'sync', 'tabId' : targetTab.id});
        DataBus.setItem('state#' + targetTab.id, 'syncing');
        adjustState(targetTab);
    });


    var btnSync = $('.btn-sync');

    btnSync.off('click').on('click', function (e) {
        e.preventDefault();

        DataBus
            .getItem('sync#' + targetTab.id)
            .then(function (result) {
                switch (result) {
                    case 'success':
                        Debug.log(debugModuleName, '用户点击重新同步按钮，通知background.js。');
                        break;
                    case 'failed':
                        DataBus.removeItem('sync#' + targetTab.id).then(function () {
                            Debug.log(debugModuleName, '用户点击重新同步按钮，通知background.js。');
                            return portBackground.postMessage({'popup' : 'sync', 'tabId' : targetTab.id});
                        });
                        break;
                    default :
                        Debug.log(debugModuleName, '用户点击重新同步按钮，通知background.js。');
                        break;
                }
            });
    });


    var btnReload = $('.btn-reload');

    btnReload.off('click').on('click', function (e) {
        e.preventDefault();
        Debug.log(debugModuleName, '用户点击重启按钮，向inject.js发送重启消息。');
        sendMessage(targetTab, {'APP:MSG' : 'RELOAD-PLUGIN'}, function (response) {
            Debug.log(debugModuleName, 'inject.js返回内容:', response);
            switch (response) {
                case 'INJECT-PAGE-RELOAD':
                    DataBus
                        .clear()
                        .then(function () {
                            window.close() &&
                            setTimeout(function () {
                                chrome.runtime.reload();
                            }, 500);
                        })
                        .catch(errorHandle.storage);
                    break;
                default :
                    //TODO: 应该重启，或者提示用户刷新页面
                    Debug.error(debugModuleName, '重启失败，页面尚未刷新。');
                    break;
            }
        });
    });


}


document.addEventListener('DOMContentLoaded', function () {
    Debug.info(vsprintf('%s 插件尝试启动。', [debugModuleName]));

    /**
     * 注册长连接给插件不同页面之间使用
     */
    chrome.runtime.onConnect.addListener(function (port) {
        Debug.info(debugModuleName, '插件通信端口连接成功:', port);
        if (port.name === 'popup' || port.name === '*') {
            port.onMessage.addListener(function (response) {
                Debug.info(debugModuleName, '收到外部消息:', response);
                if (Extension.checkUrlIsInternal(port.sender.url)) {
                    Debug.info(debugModuleName, '!!!', response);
                } else {
                    Debug.info(debugModuleName, '@@@', response);
                }
            });
        }
    });

    currentTab(
        function (targetTab) {
            /**
             * send popup shown message to inject script
             */
            sendMessage(targetTab, {'APP:MSG' : 'POPUP-SHOWN'}, function (resp) {
                Debug.info(debugModuleName, '弹出窗已被展示', resp);
                if (!resp)portBackground.postMessage({'popup' : 'shown', 'tabId' : targetTab.id});
                init(targetTab);
                adjustState(targetTab);
            });
        },
        function () {
            Debug.error(debugModuleName, '获取当前tab信息出错。');
        }
    );
});
