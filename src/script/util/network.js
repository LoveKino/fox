/**
 * Network Util
 */

/** global config **/
var Config = require('config');
/** data util **/
//var DataBus = require('data');
/** toast util **/
var Toast = require('toast');
/** debug util **/
var Debug = require('debug.js');


/** current module name for debug util **/
var debugModuleName = '[popup/network]';

// define error code
var failCode = {
    'NETWORK_ERROR' : 500,
    'REQUEST_ERROR' : 400
};

/**
 * Request data
 *
 * @param {String} name Api name
 * @param {String} uriParams The url params
 * @param {Object} data The post data
 * @param {Function} success A callback function on success
 * @param {Function} fail A callback function on fail
 * @param {Object} options A option for ajax
 * @returns {*|boolean}
 */
function request (name, uriParams, data, success, fail, options) {
    /**
     * success callback
     * @param {Object} response
     * @returns {*}
     */
    function innerSuccess (response) {
        Toast.hide();
        //DataBus.set('cs-network-status', '');
        if (response && response.status && response.status === 'success') {
            Debug.info(debugModuleName, '[请求成功]当前接口:', name, ' 返回内容:', response);
            if (success) {
                if (response.data) {
                    return success(response.data);
                } else {
                    return success(response);
                }
            }
            return true;
        } else {
            return innerFail(response);
        }
    }

    /**
     * fail callback
     * @param {Object} response
     * @returns {*}
     */
    function innerFail (response) {
        Toast.hide();
        //DataBus.set('cs-network-status', '');
        Debug.error(debugModuleName, '[请求失败]当前接口:', name, ' 返回内容:', response);

        if (response && response.status && response.status === 'fail') {
            if (fail) {
                if (response.data) {
                    return fail(response.data, failCode.REQUEST_ERROR);
                } else {
                    return fail(response, failCode.REQUEST_ERROR);
                }
            }
        } else {
            if (fail) {
                return fail(response, failCode.NETWORK_ERROR);
            } else {
                // TODO:缺少错误处理
                Debug.error(debugModuleName, response, failCode.NETWORK_ERROR);
            }
        }
    }

    // get api info by name
    var api = Config.getApiInfo(name, uriParams);

    // 判断当前网络状态
    //var status = DataBus.get('cs-network-status');
    // 防止多次提交
    if (status && status === 'locked') {
        // 理论不存在此情况
        Debug.warn(debugModuleName, '正在请求接口中，请勿重复提交。');
        return false;
    } else {
        //DataBus.set('cs-network-status', 'locked');
        Toast.data({'text' : '加载中', 'mode' : 'loading'}).show();

        var requestOptions = {
            type        : api.type,
            url         : api.uri,
            data        : JSON.stringify(data),
            contentType : 'application/json',
            success     : innerSuccess,
            error       : innerFail
        };

        if (options) {
            for (var option in options) {
                if (options.hasOwnProperty(option)) {
                    requestOptions[option] = options[option];
                }
            }
        }

        $.ajax(requestOptions);
    }

}


module.exports = {

    'request' : request
};
