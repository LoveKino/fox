/** the style of popup page. **/
require('../../../style/page/popup/main.less');

/** network util **/
var Network = require('network');
/** 格式处理 **/
var vsprintf = require('format').vsprintf;
/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/main]';

/** 行为记录 **/
var recorder = require('../../general/background/recorder');
/** 解析动作 **/

var timeForRecordStart = 0;

var container = $('.view-controls');
var heart = $('#heart');

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
    Debug.info(debugModuleName, 'sendMessage', tab, data, callback);

    chrome.tabs.sendMessage(tab.id, data, callback ? callback: function () {});
}

function toggleReload () {
    $('.reload-bar').removeCLass('fn-hide');
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
    var state = localStorage.getItem('state#' + tab.id);
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

            var sync = localStorage.getItem('sync-state#' + tab.id);

            if (sync === 'success') {
                $('.btn-sync').text('传输数据完毕');
            } else if (sync === 'fail') {
                $('.btn-sync').text('传输数据失败');
            } else {
                $('.btn-sync').text('插件出错');
                toggleReload();
            }

            break;
        default :
            heart.fadeIn();

            container.addClass('is-initialized');
            container.removeClass('is-stopped is-started');
            break;
    }
}

function init (targetTab) {

    $('.btn-reload').off('click').on('click', function () {
        //todo 这里期望能在响应消息后重载
        sendMessage(targetTab, {'APP:MSG' : 'RELOAD-PLUGIN'}, function (resp) {
            Debug.info(debugModuleName, '用户点击插件栏重载插件按钮，发送消息:', resp);
            switch (resp) {
                case 'INJECT-PAGE-RELOAD':
                    localStorage.clear();

                    window.close() &&
                    setTimeout(function () {
                        chrome.runtime.reload();
                    }, 500);
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
        sendMessage(targetTab, {'APP:MSG' : 'START-RECORD'}, function (response) {
            Debug.info(debugModuleName, '用户主动发送开始请求,响应内容:', response);
            Debug.info(debugModuleName, vsprintf('用户点击插件栏图标: %s。', ['开始录制']));
            localStorage.removeItem('records#' + targetTab.id);
            localStorage.setItem('state#' + targetTab.id, 'started');

            recorder.start();
            timeForRecordStart = new Date - 0;

            window.close() &&
            setTimeout(function () {
                adjustState(targetTab);
            }, 1000);
        });
    });

    $('.btn-stop').off('click').on('click', function (e) {
        e.preventDefault();
        Debug.warn(debugModuleName, '点击停止。', targetTab);
        sendMessage(targetTab, {'APP:MSG' : 'STOP-RECORD'}, function (response) {
            Debug.info(debugModuleName, '用户主动发送结束请求,响应内容:', response);
        });

        recorder.add('finish-record', [timeForRecordStart, new Date - 0], 'head');
        recorder.reset();

        localStorage.setItem('records#' + targetTab.id, recorder.records);
        localStorage.removeItem('state#' + targetTab.id);
        localStorage.setItem('state#' + targetTab.id, 'stopped');

        // request api to save case
        Network.request('saveCase', null, {
            user : 'test',
            pass : 'test',
            data : recorder.records
        }, function (resp) {
            if (resp && resp.status === 'success') {
                Debug.info(debugModuleName, 'case to server success');

                $('.btn-sync').text('传输数据完毕');
                localStorage.setItem('sync-state#' + targetTab.id, 'success');
            }
        }, function (resp) {
            Debug.info(debugModuleName, 'case to server fail', resp);
            $('.btn-sync').text('传输数据失败');
            localStorage.setItem('sync-state#' + targetTab.id, 'fail');
        }, {contentType : 'application/json'});

        adjustState(targetTab);
    });

    adjustState(targetTab);
}


currentTab(
    function (targetTab) {

        /**
         * send popup shown message to inject script
         */
        sendMessage(targetTab, {'APP:MSG' : 'POPUP-SHOWN'}, function (resp) {
            Debug.info(debugModuleName, '弹出窗已被展示', resp);
            if (!resp) {
                localStorage.removeItem('records#' + targetTab.id);
                localStorage.removeItem('state#' + targetTab.id);
                adjustState(targetTab);
            }
            init(targetTab);
        });

    },
    function () {
        Debug.error(debugModuleName, '获取当前tab信息出错。');
        toggleReload();
    }
);


