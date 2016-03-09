var debug = require('debug.js');
var debugModuleName = '[common/message]';

/**
 * 通信模块
 */

function sendMessageFromBackground (message, callback) {
    var tabOptions = {active : true, currentWindow : true};

    debug.info(debugModuleName, 'sendMessageFromBackground:', chrome.tabs);

    chrome.tabs && chrome.tabs.query(tabOptions, function (tabs) {
        debug.info(debugModuleName, 'sendMessage:', tabs[0].id, message, callback);
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}


function sendMessageFromContentScript (message, callback) {
    chrome.runtime && chrome.runtime.sendMessage(message, callback);
}


function onMessage (callback) {
    // request, sender, sendResponse
    try {
        chrome.runtime.onMessage.addListener(callback);
    } catch (e) {
        location.reload();
    }
}


module.exports = {
    onMessage                    : onMessage,
    sendMessageFromContentScript : sendMessageFromContentScript,
    sendMessageFromBackground    : sendMessageFromBackground
};