/**
 * 获取OS系统
 */

var DEFAULT_VERSION = '-1';
var STR_EMPTY = '';
var STR_SPACE = ' ';

function type (object) {
    return Object.prototype.toString.call(object).slice(8, -1);
}

/**
 * OS List
 * @type {*[]}
 */
var OS = [
    ['windows', /\bwindows nt ([0-9.]+)/],
    ['macosx', /\bmac os x ([0-9._]+)/],
    ['linux', 'linux']
];

/**
 * userAgent Detector
 * @param name
 * @param expression
 * @param ua
 * @returns {*}
 */
function detect (name, expression, ua) {
    var expr = type(expression) === 'Function' ? expression.call(null, ua): expression;
    if (!expr) {
        return null;
    }
    var info = {
        name     : name,
        version  : DEFAULT_VERSION,
        codename : STR_EMPTY
    };
    if (expr === true) {
        return info;
    } else if (type(expr) === 'String') {
        if (ua.indexOf(expr) !== -1) {
            return info;
        }
    } else if (type(expr) === 'Object') {
        if (expr.hasOwnProperty('version')) {
            info.version = expr.version;
        }
        return info;
    } else if (expr.exec) {
        var m = expr.exec(ua);
        if (m) {
            if (m.length >= 2 && m[1]) {
                info.version = m[1].replace(/_/g, '.');
            } else {
                info.version = DEFAULT_VERSION;
            }
            return info;
        }
    }
}

/**
 * 解析 UserAgent 字符串
 *
 * @param userAgent
 * @returns {{}}
 */
var parse = function (userAgent) {
    var detected = {name : 'N/A', version : DEFAULT_VERSION};

    (function (object, factory) {
        for (var i = 0, l = object.length; i < l; i++) {
            if (factory.call(object, object[i], i) === true) {
                break;
            }
        }
    })(OS, function (pattern) {
        var ret = detect(pattern[0], pattern[1], userAgent.toLowerCase());
        if (ret) {
            detected = ret;
            return true;
        }
    });

    var result = {
        name        : detected.name,
        version     : parseFloat(detected.version),
        fullVersion : detected.version
    };
    result[detected.name] = result.version;

    return result;
};

module.exports = parse([navigator.userAgent || STR_EMPTY, navigator.appVersion || STR_EMPTY, navigator.vendor || STR_EMPTY].join(STR_SPACE));