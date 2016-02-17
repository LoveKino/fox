/** 行为记录 **/
var recorder = require('../../general/background/recorder');
/** 插件工具栏图标 **/
var browserIcon = require('../../common/browser-icon');
/** 插件工具栏图标动画 **/
var recordAnimation = require('../../general/background/icon-animation');
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
/** 解析动作 **/
var actionParser = require('../../general/background/parse-action');
/** 消息处理 **/
var message = require('../../common/message');
/** 数据处理 **/
var data = require('data');
/** 知识库 **/
var knowledge = require('../../general/background/knowledge.js');

var timeForRecordStart = 0;

var curWorkTab = null;

var oldChromeVersion = !chrome.runtime;

function Instance () {
    if (!(this instanceof  Instance)) {
        // 使用旧版本的background选项，不存在重复创建，以免后面改为新协议，暂时保留
        Debug.warn(debugModuleName, '页面创建新实例。');
        return new Instance();
    }
    this.isRunning = false;
    Debug.info(debugModuleName, '插件创建新实例。');
}

Instance.prototype.bootstrap = function () {
    Debug.info(debugModuleName, '插件尝试启动。');

    var self = this;
    chrome.browserAction.onClicked.addListener(function () {

        var option = {currentWindow : true, active : true};

        function checkCurrentTabisCorrect (tabs) {
            var targetTab = tabs[0];
            return helper.isStandardLink(targetTab.url, ['http', 'https']);
        }

        chrome.tabs.query(option, function (tabs) {
            if (tabs && tabs.length) {
                if (checkCurrentTabisCorrect(tabs)) {
                    if (!self.isRunning) {
                        recorder.start();
                        Debug.info(debugModuleName, vsprintf('用户点击插件栏图标: %s。', ['开始录制']));
                        curWorkTab = tabs;
                        Debug.info(debugModuleName, vsprintf('当前选择的选项卡为: %s。', [curWorkTab]));
                        browserIcon.start();
                        data.del('originRecords');
                        data.del('records');
                        data.save();
                        message.sendMessageFromBackground({'APP:MSG' : 'START-RECORD'}, function (response) {
                            Debug.info(debugModuleName, '用户主动发送开始请求,响应内容:', response);
                        });
                        timeForRecordStart = new Date - 0;
                    } else {
                        recorder.add('finish-record', [timeForRecordStart, new Date - 0], 'head');
                        recorder.reset();
                        Debug.info(debugModuleName, vsprintf('[插件栏按钮]用户点击插件栏图标: %s。', ['停止录制']));
                        browserIcon.stop();
                        Debug.info(debugModuleName, '持久化行为事件以便展示处理:', recorder.records);
                        data.set('originRecords', recorder.records);
                        data.set('records', actionParser(recorder.records));
                        data.save();
                        Debug.info(debugModuleName, '插件主动展示插件栏弹出窗。');
                        self.showPopup();
                    }
                    self.isRunning = !self.isRunning;

                    Debug.info(debugModuleName, '当前插件ID:', chrome.runtime.id);

                } else {
                    knowledge.showTopic('error', 'not-allow-page');
                }
            }
        });


    });
};


Instance.prototype.showPopup = function (behaviourCount) {
    chrome.browserAction.setPopup({popup : 'page/popup/main.html'});
    chrome.browserAction.setBadgeText({text : behaviourCount || ''});
};

/**
 * 获取黑名单
 * @returns {string[]}
 */
function getUrlBlackList () {
    return ['chrome://'];
}

/**
 * 检查页面合法性
 * @param url
 * @returns {boolean}
 */
function isCorrectUrl (url) {
    var result = true;
    var blackList = getUrlBlackList();

    for (var i = 0, j = blackList.length; i < j; i++) {
        if (url.indexOf(blackList[i]) === 0) {
            result = false;
            break;
        }
    }

    return result;
}


/**
 *
 * @param params
 */
function process (params) {

    if (!params) {
        Debug.error(debugModuleName, 'Background Process Called Without Params.');
        return;
    }

    /**
     * 清除动画
     * @notice 仅当传递参数包含录制动画时
     */
    function stopAnimation () {
        if (params.showRecordingAnimation) {
            Debug.info(debugModuleName, '插件图标栏动画展示结束。');
            recordAnimation.stop();
        }
    }

    if (params.showRecordingAnimation) {
        Debug.info(debugModuleName, '插件图标栏动画展示开始。');
        recordAnimation.start();
    }

    setTimeout(function () {
        browserIcon.updateIcon();
        stopAnimation();
    }, 2000);

}


function onInit () {

    Debug.info(debugModuleName, 'onInit');

    localStorage.initFailureCount = 0;

    browserIcon.stop();

    process({initPlugin : true, showRecordingAnimation : true});

    var canvas = document.getElementById('canvas');
    var iconReload = document.getElementById('icon-reload');
    if (canvas && iconReload) {
        browserIcon.flip(canvas, iconReload);
    } else {
        Debug.error('onInit: lose canvas elem or reload icon.');
    }

    if (!oldChromeVersion) {
        chrome.alarms.create('watchdog', {periodInMinutes : 5});
    }
}

function onAlarm (alarm) {

    Debug.info(debugModuleName, 'onAlarm');

    if (alarm && alarm.name === 'watchdog') {
        onWatchdog();
    } else {
        process({initPlugin : true, showRecordingAnimation : false});
    }
}

function onWatchdog () {
    chrome.alarms.get('refresh', function (alarm) {
        if (alarm) {
            Debug.info(debugModuleName, '已存在定时器，无需重复创建。');
        } else {
            Debug.info(debugModuleName, '创建定时器。');
            process({initPlugin : true, showRecordingAnimation : false});
        }
    });
}


var filters = {
    // TODO: Cannot use urlPrefix because all the url fields lack the protocol
    // part. See crbug.com/140238.
    url : [{urlContains : 'http://*'.replace(/^https?\:\/\//, '')}]
};

function onNavigate (details) {
    if (details.url && isCorrectUrl(details.url)) {
        Debug.info(debugModuleName, '页面加载完毕' + details.url);
    }
}
if (chrome.webNavigation &&
    chrome.webNavigation.onDOMContentLoaded &&
    chrome.webNavigation.onReferenceFragmentUpdated) {
    chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);
    chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, filters);
} else {
    //TODO: 考虑 onBeforeNavigate
    if (chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.addListener(function (_, details) {onNavigate(details);});
    } else {
        Debug.info(debugModuleName, '初始化出现问题。');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (oldChromeVersion) {
        browserIcon.updateIcon();
        onInit();
    } else {
        chrome.runtime.onInstalled.addListener(onInit);
        chrome.alarms.onAlarm.addListener(onAlarm);
    }

    (new Instance()).bootstrap();
});
