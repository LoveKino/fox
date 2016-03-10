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

var port = chrome.runtime.connect({'name' : 'background'});
port.postMessage({'popup' : 'init'});

var errorHandle = require('../../common/error-handle');


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


function toggleReload () {
    $('.reload-bar').removeClass('fn-hide');
}


/**
 * Toggle heart beat speed
 */
function toggleHeart () {
    $('#heart').toggleClass('slow-beat fast-beat');
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
                heart.fadeIn();
                toggleHeart();
                container.addClass('is-started');
                container.removeClass('is-stopped is-initialized');
                break;
            case 'stopped':
                toggleHeart();
                container.addClass('is-stopped');
                container.removeClass('is-started is-initialized');

                heart.fadeOut();
                $('#sync-data').fadeIn();

                DataBus
                    .getItem('sync-state#' + tab.id)
                    .then(function (sync) {
                        if (sync === 'success') {
                            $('.btn-sync').text('传输数据完毕');
                        } else if (sync === 'fail') {
                            $('.btn-sync').text('传输数据失败');
                        } else {
                            $('.btn-sync').text('插件出错');
                            toggleReload();
                        }
                    })
                    .catch(errorHandle.storage);

                break;
            default :
                heart.fadeIn();

                container.addClass('is-initialized');
                container.removeClass('is-stopped is-started');
                break;
        }
    }
}


function init (targetTab) {

    $('.btn-reload').off('click').on('click', function () {
        //todo 这里期望能在响应消息后重载
        sendMessage(targetTab, {'APP:MSG' : 'RELOAD-PLUGIN'}, function (resp) {
            Debug.info(debugModuleName, '用户点击插件栏重载插件按钮，发送消息:', resp);
            switch (resp) {
                case 'INJECT-PAGE-RELOAD':
                    DataBus
                        .clear()
                        .then(function () {
                            //window.close() &&
                            setTimeout(function () {
                                chrome.runtime.reload();
                            }, 500);
                        })
                        .catch(errorHandle.storage);
                    break;
                default :
                    Debug.info(debugModuleName, '重启失败，页面尚未刷新。');
                    break;
            }
        });
    });

    $('.btn-start').off('click').on('click', function (e) {
        e.preventDefault();
        Debug.warn(debugModuleName, '点击开始。');
        port.postMessage({
            'popup'  : 'start',
            'tabId'  : targetTab.id,
            'width'  : targetTab.width,
            'height' : targetTab.height,
            'url'    : targetTab.url
        });
        port.onMessage.addListener(function (response) {
            if (response.state === 'started') {
                Debug.log(debugModuleName, '收到BG开始录制消息。');
                DataBus
                    .setItem('state#' + targetTab.id, 'started')
                    .then(function () {
                        return sendMessage(targetTab, {'APP:MSG' : 'START-RECORD'}, function (response) {
                            Debug.info(debugModuleName, '用户主动发送开始请求,响应内容:', response);
                            //window.close() &&
                            setTimeout(function () {adjustState(targetTab);}, 1000);
                        });
                    })
                    .catch(errorHandle.storage);
            } else {
                Debug.warn('BG未准备好录制事件。');
            }
        });
    });

    var btnSync = $('.btn-sync');

    $('.btn-stop').off('click').on('click', function (e) {
        e.preventDefault();
        port.postMessage({'popup' : 'stop', 'tabId' : targetTab.id});
        port.onMessage.addListener(function (response) {
            Debug.info(debugModuleName, response);

            Debug.warn(debugModuleName, '点击停止。', targetTab);
            sendMessage(targetTab, {'APP:MSG' : 'STOP-RECORD'}, function (response) {
                Debug.info(debugModuleName, '用户主动发送结束请求,响应内容:', response);
            });

            DataBus
                .setItem('state#' + response.tabId, 'stopped')
                .then(function () {
                    adjustState(targetTab);

                    // todo split
                    switch (response.state) {
                        case 'SYNC-READY':
                            btnSync.text('传输数据完毕');
                            break;
                        case 'SYNC-FAILED':
                            btnSync.text('传输数据失败');
                            break;
                    }
                })
                .catch(errorHandle);
        });
    });

    adjustState(targetTab);
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
                    Debug.info(debugModuleName, '@2@', response);
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
                if (!resp) {
                    port.postMessage({'popup' : 'shown', 'tabId' : targetTab.id});
                    port.onMessage.addListener(function (response) {
                        Debug.info(debugModuleName, response);
                        //DataBus.removeItem('state#' + targetTab.id);
                        adjustState(targetTab);
                    });
                }
                init(targetTab);
            });

        },
        function () {
            Debug.error(debugModuleName, '获取当前tab信息出错。');
            toggleReload();
        }
    );
});
