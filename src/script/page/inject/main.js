var message = require('../../common/message');

var debug = require('debug.js');
var debugModuleName = '[inject/main]';

var helper = require('helper');
var getCssPath = require('../../general/inject/get-css-path');
var progress = require('../../general/inject/progress');
var progressHandler = null;

var handle = null;

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

/**
 * 展示Banner
 * @param content
 */
Instance.prototype.showBanner = function (content) {

    var autoCloseDelay = 3000;

    var container = document.createElement('div');
    container.setAttribute('id', 'inject-banner');
    container.style.cssText = [
        'width:100%;',
        'height:30px;',
        'color:#FFF;',
        'position:fixed;',
        'top:0px;',
        'z-index:409620481024;',
        'text-align:left;',
        'background-color:#26C0E3;'
    ].join('');

    var iconPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5QUE2OTVDRThFNzExMUU1ODEyQURGQjY3RTA4N0JFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERTFERDk4ODhFNzIxMUU1ODEyQURGQjY3RTA4N0JFRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlBQTY5NUNDOEU3MTExRTU4MTJBREZCNjdFMDg3QkVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlBQTY5NUNEOEU3MTExRTU4MTJBREZCNjdFMDg3QkVEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+w4sTegAAH6hJREFUeNrsXQmY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';

    var banner = document.createElement('div');
    banner.style.cssText = [
        '-webkit-user-select: none;',
        'display: block;',
        'font-size: 18px;',
        'font-weight: bold;',
        'padding-left: 30px;',
        'line-height: 30px;',
        'width: 150px;',
        'margin: 0 auto;',
        'background-position: 1px 1px;',
        'background-size: 26px 26px;',
        'background-repeat: no-repeat;',
        'background-image:url(\'' + iconPhoto + '\');'
    ].join('');

    banner.innerHTML = content;
    container.appendChild(banner);
    document.body.appendChild(container);

    window.setTimeout(function () {
        if (document.body && container) document.body.removeChild(container);
        loopProgress();
    }, autoCloseDelay);

};

/**
 * 循环展示滚动条
 */
function loopProgress () {

    progressHandler = setInterval(function () {
        progress.configure({showSpinner : false, speed : 500}).start().done(true);
    }, 2000);

}

function processMessageFromBackground (message) {
    switch (message) {
        case 'START-RECORD':
            debug.info(debugModuleName, '接收到插件消息，开始记录事件');
            break;
        case 'RELOAD-PLUGIN':
            debug.info(debugModuleName, '接收到插件消息，卸载原有事件');
            handle.deInit();
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

    var self = this;


    function job () {
        self.monitor(watchElementList, watchEventList, 'register');
        self.monitor([], 'copy', 'register');
    }

    job();

    document.addEventListener('DOMNodeInserted', function (e) {
        if (e.target) {
            if (e.target.id === 'nprogress') {
                return;
            }
            if (e.target.getElementsByTagName) {
                var newNodeList = e.target.getElementsByTagName('*');
                if (newNodeList.length) {
                    self.monitor(newNodeList, watchEventList, 'register');
                }
            }
        }
    }, false);

    this.showBanner('Record Start.');

    return this;
};


Instance.prototype.deInit = function () {

    clearInterval(progressHandler);

    this.monitor(watchElementList, watchEventList, 'cancel');
    this.monitor([], 'copy', 'cancel');

    return this;
};

message.onMessage(function (request, sender) {
    if (request && request.hasOwnProperty('APP:MSG')) {
        debug.info(debugModuleName, '接收插件发送消息:', request, sender);
        processMessageFromBackground(request['APP:MSG']);
    }
});

/**
 * 初始化
 */
handle = (new Instance());
handle.init();
if (window.navigator) {
    handle.sendMessage('USER::CMD', 'visit', {ua : window.navigator.userAgent});
}