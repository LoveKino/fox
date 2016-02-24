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
/** 数据储存 **/
var Data = require('data');
/** 行为记录 **/
var recorder = require('../../general/background/recorder');

/** Record Start Time **/
var timeForRecordStart = 0;

var container = $('.view-controls');
var heart = $('#heart');

var recordData = null;

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

/**
 * Toggle reload bar visible
 */
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
    var state = Data.load('state', tab.id);
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

            var sync = Data.load('sync-state', tab.id);

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


/**
 * Bind Reload Btn Event
 * @param tab
 */
function reloadBtn (tab) {
    $('.btn-reload').off('click').on('click', function () {
        /**
         * 尝试在注入脚本响应消息后再执行插件重载
         */
        sendMessage(tab, {'APP:MSG' : 'RELOAD-PLUGIN'}, function (resp) {
            Debug.info(debugModuleName, '用户点击插件栏重载插件按钮，发送消息:', resp);
            switch (resp) {
                case 'INJECT-PAGE-RELOAD':
                    // 清除所有插件数据
                    Data.clear();

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
}


/**
 * Bind Start Btn Event
 * @param tab
 */
function startBtn (tab) {
    $('.btn-start').off('click').on('click', function (e) {
        e.preventDefault();
        Debug.warn(debugModuleName, '点击开始。');
        sendMessage(tab, {'APP:MSG' : 'START-RECORD'}, function (response) {
            Debug.info(debugModuleName, '用户主动发送开始请求,响应内容:', response);

            Debug.info(debugModuleName, vsprintf('用户点击插件栏图标: %s。', ['开始录制']));
            Data.clear('records', tab.id);
            Data.save('state', 'started', tab.id);
            recorder.start(tab);
            timeForRecordStart = new Date - 0;

            window.close() &&
            setTimeout(function () {
                adjustState(tab);
            }, 1000);
        });
    });
}


/**
 * Bind Stop Btn Event
 * @param tab
 */
function stopBtn (tab) {
    $('.btn-stop').off('click').on('click', function (e) {
        e.preventDefault();
        Debug.warn(debugModuleName, '点击停止。', tab);
        sendMessage(tab, {'APP:MSG' : 'STOP-RECORD'}, function (response) {
            Debug.info(debugModuleName, '用户主动发送结束请求,响应内容:', response);
        });

        recorder.add(tab.id, 'finish-record', [timeForRecordStart, new Date - 0], 'head');
        recordData = recorder.getData(tab.id);
        recorder.reset(tab);

        Data.save('records', recordData, tab.id);
        Data.save('state', 'stopped', tab.id);

        // request api to save case
        Network.request('saveCase', null, {
            user : 'test',
            pass : 'test',
            data : recordData
        }, function (resp) {
            if (resp && resp.status === 'success') {
                Debug.info(debugModuleName, 'case to server success');
                $('.btn-sync').text('传输数据完毕');
                Data.save('sync-state', 'success', tab.id);
            }
        }, function (resp) {
            Debug.info(debugModuleName, 'case to server fail', resp);
            $('.btn-sync').text('传输数据失败');
            Data.save('sync-state', 'fail', tab.id);
        }, {contentType : 'application/json'});

        adjustState(tab);
    });
}

/**
 * Bind Sync Btn Event
 * @param tab
 */
function syncBtn (tab) {
    $('.btn-sync').off('click').on('click', function (e) {
        e.preventDefault();
        Debug.warn(debugModuleName, '点击传输。', tab);

        // request api to save case
        Network.request('saveCase', null, {
            user : 'test',
            pass : 'test',
            data : recordData
        }, function (resp) {
            if (resp && resp.status === 'success') {
                Debug.info(debugModuleName, 'case to server success');
                $('.btn-sync').text('传输数据完毕');
                Data.save('sync-state', 'success', tab.id);
            }
        }, function (resp) {
            Debug.info(debugModuleName, 'case to server fail', resp);
            $('.btn-sync').text('传输数据失败');
            Data.save('sync-state', 'fail', tab.id);
        }, {contentType : 'application/json'});

        adjustState(tab);
    });
}

/**
 * Init
 * @param tab
 */
function init (tab) {
    /**
     * bind btn events
     */
    reloadBtn(tab);

    startBtn(tab);

    stopBtn(tab);

    syncBtn(tab);

    /**
     * init view state
     */
    adjustState(tab);
}


currentTab(
    function (tab) {
        /**
         * send popup shown message to inject script
         */
        sendMessage(tab, {'APP:MSG' : 'POPUP-SHOWN'}, function (resp) {
            Debug.info(debugModuleName, '弹出窗已被展示', resp);
            if (!resp) {
                Data.clear('records', tab.id);
                Data.clear('state', tab.id);
                adjustState(tab);
            }
            init(tab);
        });
    },
    function () {
        Debug.error(debugModuleName, '获取当前tab信息出错。');
        toggleReload();
    }
);


