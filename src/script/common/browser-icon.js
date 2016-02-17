/**
 * 处理工具栏浏览器图标
 */

var debug = require('debug.js');
var debugModuleName = 'common/browser-icon';

var helper = require('helper');

var rotation = 0;
var animationFrames = 36;
var animationSpeed = 10; // 单位ms

var ICON_START = '/image/onion-box/photo.png';
var ICON_PAUSE = '/image/onion-box/pause.png';
var ICON_STOP = '/image/onion-box/default.png';
var ICON_DEFAULT = '/image/onion-box/default.png';

try {
    var setIcon                 = chrome.browserAction.setIcon,
        setBadgeText            = chrome.browserAction.setBadgeText,
        setBadgeBackgroundColor = chrome.browserAction.setBadgeBackgroundColor;

    module.exports = {
        stop       : stop,
        pause      : pause,
        start      : start,
        reset      : reset,
        updateIcon : updateIcon,
        flip       : flip
    };

} catch (e) {
    debug.error(debugModuleName, '插件加载出现错误，尝试自动重新加载插件。');

    // 运行时错误，尝试硬性重载环境（重新加载资源）
    window.location.reload();

    // 避免出现更多错误
    module.exports = {
        stop       : helper.empty,
        pause      : helper.empty,
        start      : helper.empty,
        reset      : helper.empty,
        updateIcon : helper.empty,
        flip       : helper.empty
    };
}

/**
 * 旋转图标
 * @param canvas
 * @param image
 */
function flip (canvas, image) {
    if (!canvas) {
        return;
    }
    var canvasContext = canvas.getContext('2d');

    function ease (x) {
        return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
    }

    function drawIconAtRotation () {
        canvasContext.save();
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.translate(Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
        canvasContext.rotate(2 * Math.PI * ease(rotation));
        canvasContext.drawImage(image, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
        canvasContext.restore();

        setIcon({imageData : canvasContext.getImageData(0, 0, canvas.width, canvas.height)});
    }

    rotation += 1 / animationFrames;
    drawIconAtRotation();

    if (rotation <= 1) {
        (function () {
            setTimeout(function () {
                flip(canvas, image);
            }, animationSpeed);
        }(canvas, image));
    } else {
        rotation = 0;
        updateIcon('reset');
    }
}


/**
 * 更新图标状态
 * @param type
 * @returns {*}
 */
function updateIcon (type) {
    switch (type) {
        case 'start':
            return start();
        case 'pause':
            return pause();
        case 'stop':
            return stop();
        default :
            return reset();
    }
}


/**
 * 设置停止状态
 * @param txt
 */
function stop (txt) {
    setIcon({path : ICON_STOP});
    if (txt) {
        setBadgeText({text : txt});
        setBadgeBackgroundColor({color : [245, 133, 45, 255]});
    } else {
        setBadgeText({text : ''});
    }
}


/**
 * 设置暂停状态
 */
function pause () {
    setIcon({path : ICON_PAUSE});
    setBadgeText({text : '='});
    setBadgeBackgroundColor({color : [232, 226, 86, 255]});
}

/**
 * 设置开始状态
 */
function start () {
    setIcon({path : ICON_START});
    setBadgeText({text : '>'});
    setBadgeBackgroundColor({color : [81, 226, 81, 1]});
}

/**
 * 重置状态
 */
function reset () {
    setIcon({path : ICON_DEFAULT});
    setBadgeText({text : ''});
    setBadgeBackgroundColor({color : [190, 190, 190, 230]});
}
