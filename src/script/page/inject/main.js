var message = require('../../common/message');

var debug = require('debug.js');
var debugModuleName = '[inject/main]';

var piecon = require('../../general/inject/piecon');
piecon.setOptions({'useCache' : true, 'fallback' : false});

var helper = require('helper');
var getCssPath = require('../../general/inject/get-css-path');

var inst = null;

function Instance () {
    if (!(this instanceof Instance)) {
        return new Instance();
    }
}

/**
 * send message to plugin background
 *
 * @param eventGroup
 * @param eventType
 * @param nodeOrData
 */
Instance.prototype.sendMessage = function (eventGroup, eventType, nodeOrData) {

    // common message object
    var message = {
        type      : eventType,
        category  : eventGroup,
        timestamp : (new Date - 0),    //@notice 使用插件内建时间，而非event.timeStamp
        //todo:考虑hash
        data      : {
            url : [location.protocol + '//', location.host, location.pathname, location.search].join('')
        }
    };

    // is message is element event
    if (nodeOrData.target) {
        var node = nodeOrData;
        var target = node.target;

        message.cssPath = getCssPath(target, true);

        if (target.value) {
            message.target = target.value;
        }

        var e = {};
        var eventPropList = [];
        // TODO: 参考https://developer.mozilla.org/en-US/docs/Web/API/Event补全
        switch (eventGroup) {
            case 'Mouse':
                eventPropList = [
                    'altKey', 'button', 'buttons', 'metaKey', 'ctrlKey', 'shiftKey', 'which', 'region',
                    'clientX', 'clientY', 'movementX', 'movementY', 'offsetX', 'offsetY',
                    'pageX', 'pageY', 'screenX', 'screenY', 'x', 'y'
                ];
                break;
            case 'Keyboard':
                eventPropList = [
                    'altKey', 'metaKey', 'ctrlKey', 'shiftKey', 'which',
                    'code', 'key', 'keyCode', 'location', 'isComposing'
                ];
                break;
            case 'Touch':
                eventPropList = [
                    'altKey', 'metaKey', 'ctrlKey', 'shiftKey', 'changedTouches', 'targetTouches', 'touches'
                ];
                break;
            case 'Control':
                eventPropList = ['relatedTarget'];
                break;
        }

        for (var i = 0, j = eventPropList.length; i < j; i++) {
            if (node[eventPropList[i]]) {
                e[eventPropList[i]] = node[eventPropList[i]];
            }
        }

        message.event = e;

        debug.debug(debugModuleName, '记录到交互事件:', eventType, node);
        debug.debug(debugModuleName, '保存事件相关数据:', JSON.stringify(e), '\n');
    } else {
        for (var prop in nodeOrData) {
            if (nodeOrData.hasOwnProperty(prop) && prop !== 'url') {
                message.data[prop] = nodeOrData[prop];
            }
        }
    }

    /**
     * popup以及chrome://extensions/ 重载插件后需要干掉之前的绑定，参考option 2
     * @notice http://stackoverflow.com/questions/25840674/chrome-runtime-sendmessage-throws-exception-from-content-script-after-reloading
     */
    function isValidChromeRuntime () {
        return chrome.runtime && !!chrome.runtime.getManifest();
    }

    if (isValidChromeRuntime()) {
        chrome.runtime.sendMessage(message);
    } else {
        this.deInit();
    }
};


/**
 * 处理复制操作
 */
Instance.prototype.watchCopy = function () {
    var self = this;
    window.onkeydown = function (event) {
        if (event.keyCode === 67 && event.ctrlKey) {
            var selObj = window.getSelection();
            self.sendMessage('USER::CMD', 'copy', selObj.focusNode);
        }
    };
};


/**
 * 监控事件
 *
 * @param tagNameList
 * @param eventListenerList
 * @param action
 * @returns {*}
 */
Instance.prototype.monitor = function (tagNameList, eventListenerList, action) {
    if (!eventListenerList.length) {
        return;
    } else {
        if (typeof eventListenerList === 'string') {
            eventListenerList = [eventListenerList];
        }
    }

    if (!tagNameList.length) {
        if (eventListenerList.length && eventListenerList[0] === 'copy') {
            return this.watchCopy();
        }
        return;
    }

    var self = this;

    function process (eventListener, event) {
        if (event.currentTarget !== event.target) return;

        switch (eventListener) {
            // Mouse
            case 'click':
            case 'dblclick':
            case 'mousedown':
            case 'mouseup':
            case 'mouseover':
            case 'mousemove':
            case 'mouseenter':
            case 'mouseleave':
            case 'mousewheel':
            case 'wheel':
            case 'contextmenu':
                return self.sendMessage('Mouse', eventListener, event);
            // Touch
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
            case 'touchcancel':
                return self.sendMessage('Touch', eventListener, event);
            // Keyboard
            case 'keypress':
            case 'keydown':
            case 'keyup':
            case 'input':
                return self.sendMessage('Keyboard', eventListener, event);
            // Load
            case 'load':
            case 'beforeunload':
            case 'unload':
            case 'abort':
            case 'error':
            case 'hashchange':
            case 'popstate':
                return self.sendMessage('Load', eventListener, event);
            //Drag /Drop
            case 'dragenter':
            case 'dragover':
            case 'dragleave':
            case 'drop':
                return self.sendMessage('DragDrop', eventListener, event);
            //Control
            case 'resize':
            case 'scroll':
            case 'zoom':
            case 'focus':
            case 'blur':
            case 'select':
            case 'change':
            case 'submit':
            case 'reset':
                return self.sendMessage('Control', eventListener, event);
            // Media
            case 'play':
            case 'pause':
            case 'playing':
            case 'canplay':
            case 'canplaythrough':
            case 'seeking':
            case 'seeked':
            case 'timeupdate':
            case 'ended':
            case 'ratechange':
            case 'durationchange':
            case 'volumechange':
            case 'loadstart':
            case 'progress':
            case 'suspend':
            //case 'abort':
            //case 'error':
            case 'emptied':
            case 'stalled':
            case 'loadedmetadata':
            case 'loadeddata':
            case 'waiting':
                return self.sendMessage('Media', eventListener, event);
        }
    }

    //TODO UNLOAD
    if (helper.is.array(tagNameList)) {
        helper.each(tagNameList, function (tagName) {
            var elements = document.getElementsByTagName(tagName);
            for (var i = 0, j = elements.length; i < j; i++) {
                var element = elements[i];
                helper.each(eventListenerList, function (eventListener) {
                    (function () {
                        switch (action) {
                            case 'cancel':
                                element.removeEventListener(eventListener, function (event) {
                                    process(eventListener, event);
                                });
                                break;
                            case 'register':
                                element.addEventListener(eventListener, function (event) {
                                    process(eventListener, event);
                                });
                                break;
                        }
                    }(eventListener));
                });
            }
        });
    } else {
        for (var m = 0, n = tagNameList.length; m < n; m++) {
            var element = tagNameList[m];
            helper.each(eventListenerList, function (eventListener) {
                (function () {
                    switch (action) {
                        case 'register':
                            element.addEventListener(eventListener, function (event) {
                                if (event.currentTarget !== event.target) return;
                                event.stopPropagation();
                                process(eventListener, event);
                            });
                            break;
                    }
                }(eventListener));
            });
        }
    }
};

Instance.prototype.progressIconTimeHandle = null;
Instance.prototype.progressIconCount = 0;

Instance.prototype.progressIcon = function (action) {
    var _ = this;

    switch (action) {
        case 'start':
            _.progressIconCount = 0;
            //piecon.setOptions();
            this.progressIconTimeHandle = setInterval(function () {
                if (++_.progressIconCount > 100) {
                    piecon.reset();
                    _.progressIconCount = 0;
                }
                piecon.setProgress(_.progressIconCount);
            }, 150);
            break;
        case 'stop':
            clearTimeout(_.progressIconTimeHandle);
            break;
        default :
            clearTimeout(_.progressIconTimeHandle);
            break;
    }

};

function processMessageFromBackground (message, sender, sendResponse) {
    switch (message) {
        case 'START-RECORD':
            debug.info(debugModuleName, '接收到插件消息，开始记录事件');
            break;
        case 'STOP-RECORD':
            debug.info(debugModuleName, '接收到插件消息，停止记录事件');
            inst.deInit();
            break;
        case 'RELOAD-PLUGIN':
            debug.info(debugModuleName, '接收到插件消息，卸载原有事件');
            inst.deInit();
            sendResponse('INJECT-PAGE-RELOAD');
            location.reload();
            break;
        case 'POPUP-SHOWN':
            debug.info(debugModuleName, '收到插件消息，控制窗口被展示');
            sendResponse('INJECT-READY');
            break;
        default :
            debug.error(debugModuleName, '出现尚未支持的命令', message);
            break;
    }

}

var watchEventList = [
    'click', 'dblclick',
    'focus', 'scroll',
    'keypress',
    'touchstart', 'touchend'];

var watchElementList = [
    'body', 'div', 'span', 'p',
    'em', 'b', 'u', 's', 'small',
    'li', 'ul', 'ol', 'dl', 'dt',
    'h1', 'h2', 'h3', 'h4', 'h5',
    'a', 'button', 'input', 'textarea', 'img'
];

Instance.prototype.init = function () {

    var _ = this;

    _.monitor(watchElementList, watchEventList, 'register');
    _.monitor([], 'copy', 'register');

    document.addEventListener('DOMNodeInserted', function (e) {
        if (e.target && e.target.getElementsByTagName) {
            var newNodeList = e.target.getElementsByTagName('*');
            if (newNodeList.length) {
                _.monitor(newNodeList, watchEventList, 'register');
            }
        }
    }, false);

    _.progressIcon('start');

    return this;
};


Instance.prototype.deInit = function () {

    this.progressIcon('stop');

    this.monitor(watchElementList, watchEventList, 'cancel');
    this.monitor([], 'copy', 'cancel');

    return this;
};


message.onMessage(function (request, sender, sendResponse) {
    if (request && request.hasOwnProperty('APP:MSG')) {
        debug.info(debugModuleName, '接收插件发送消息:', request, sender, sendResponse);
        processMessageFromBackground(request['APP:MSG'], sender, sendResponse);
    }
});


/**
 * 初始化
 */
inst = (new Instance());
inst.init();
if (window.navigator) {
    inst.sendMessage('USER::CMD', 'visit', {ua : window.navigator.userAgent});
}
