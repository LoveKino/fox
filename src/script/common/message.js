/**
 * 通信模块
 */

function sendMessageFromBackground (message, callback) {
    var tabOptions = {active : true, currentWindow : true};

    chrome.tabs && chrome.tabs.query(tabOptions, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}


function sendMessageFromContentScript (message, callback) {
    chrome.runtime && chrome.runtime.sendMessage(message, callback);
}


function onMessage (callback) {
    // request, sender, sendResponse
    chrome.runtime.onMessage.addListener(callback);
}


module.exports = {
    onMessage                    : onMessage,
    sendMessageFromContentScript : sendMessageFromContentScript,
    sendMessageFromBackground    : sendMessageFromBackground
};