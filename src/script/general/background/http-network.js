/**
 * Chrome 网络请求处理
 *
 * usegae:
 httpNetwork.request(function (details) {
        function processHeaders (headers) {
            switch (headers.name) {
                case 'User-Agent':
                    headers.value = 'modify headers';
                    return headers;
            }
        }

        var headers          = details.requestHeaders,
            blockingResponse = {};

        for (var i = 0, l = headers.length; i < l; ++i) {
            headers[i] = processHeaders(headers[i]);
            debug.log(headers[i]);
        }

        blockingResponse.requestHeaders = headers;
        return blockingResponse;
    });

 httpNetwork.response(function (details) {
        details.responseHeaders.push({name : 'Access-Control-Allow-Origin', value : "*"});
        details.responseHeaders.push({name : 'ABC', value : "123"});
        debug.log(details.responseHeaders);
        return {responseHeaders : details.responseHeaders};
    });
 *
 */


var STR_ACTION_BLOCKING = 'blocking';

var STR_ALL_URLS = '<all_urls>';

/**
 * 处理请求头
 * @param func
 * @param urls
 */
function requestHeaders (func, urls) {
    chrome.webRequest.onBeforeSendHeaders.addListener(func, {urls : [urls || STR_ALL_URLS]}, ['requestHeaders', STR_ACTION_BLOCKING]);
}

/**
 * 处理响应头
 *
 * @notice [修改响应头network面板不显示](http://blog.csdn.net/qidizi/article/details/40785247)
 * @param func
 * @param urls
 */
function responseHeaders (func, urls) {
    chrome.webRequest.onHeadersReceived.addListener(func, {urls : [urls || STR_ALL_URLS]}, ['responseHeaders', STR_ACTION_BLOCKING]);
}

/**
 * remove network headers handles
 */
function resetHandle (type, func) {
    switch (type) {
        case 'response':
            chrome.webRequest.onHeadersReceived.removeListener(func);
            break;
        case 'request':
            chrome.webRequest.onBeforeSendHeaders.removeListener(func);
            break;
    }
    return this;
}

/**
 * drop 请求
 * @param func
 * @param urls
 */
function blockRequest (func, urls) {
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        if (func(details)) {
            return {cancel : true};
        }
    }, {urls : [urls || STR_ALL_URLS]}, [STR_ACTION_BLOCKING]);
}

module.exports = {
    request      : requestHeaders,
    response     : responseHeaders,
    blockRequest : blockRequest,
    resetHandle  : resetHandle
};