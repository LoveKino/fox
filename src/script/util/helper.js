/**
 * 通用API声明
 *
 * @author @soulteary
 * @date 2015.07.13
 * @desc 通用API声明
 */

var urlParamParser = require('url-param-parser');

var hasOwn = Object.hasOwnProperty;
var support = {};
var undef = void 0;

var doc = document;

function toString (obj) {
    return Object.prototype.toString.call(obj);
}

function type (obj) {
    if (obj === null) {
        return obj + '';
    }
    return toString(obj).slice(8, -1).toLowerCase();
}

function isType (type) {
    return function (obj) {
        return toString(obj) === '[object ' + type + ']';
    };
}

var isObject = isType('Object');
var isString = isType('String');
var isArray = Array.isArray || isType('Array');
var isFunction = isType('Function');
var isUndefined = isType('Undefined');
var isNumber = isType('Number');
var isNumeric = function (obj) {
    return isNaN(obj) === false && isNumber(obj);
};

function isWindow (obj) {
    /* jshint -W041 */
    return obj != null && obj === obj.window;
}

function isPlainObject (obj) {
    var key;
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (!obj || !isObject(obj) || obj.nodeType || isWindow(obj)) {
        return false;
    }

    try {
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
    } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
    }

    // Support: IE<9
    // Handle iteration over inherited properties before own properties.
    if (support.ownLast) {
        /* jshint -W089 */
        for (key in obj) {
            return hasOwn.call(obj, key);
        }
    }

    return key === undefined || hasOwn.call(obj, key);
}

function contain (str, find) {
    return str.indexOf(find) > -1;
}

function startWith (str, find) {
    return 0 === str.indexOf(find);
}

function endWith (str, find) {
    var strLen = str.length, findLen = find.length;
    return strLen >= findLen && str.indexOf(find) === strLen - findLen;
}

function trim (str) {
    return isString(str) ? str.replace(/^\s+|\s+$/g, ''): '';
}


function getHost () {
    return location.host.match(/(.*\.)?(.*\.\w+)$/);
}

function getCookie (name) {
    var matches = doc.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]+)'));
    return matches ? matches[1]: '';
}

/**
 * 转换最多二维数据到URI参数
 *
 * a                   => a
 * {a:1,b:2,c:[1,2,3]} => a=1&b=2&c=1,2,3  对象中仅能有一层数组
 * [abc,de]            => abc&de           允许一维数组
 * [{abc:1}, {def:2}]  => abc=1&def=2      数组中仅能有一层对象
 *
 * @param data
 * @returns {string}
 */
function parseParams (data) {
    var ret = [];
    var encode = encodeURIComponent;

    function makeObjectToParams (data) {
        var key, ret = [];
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                var item = data[key];
                if (isArray(item)) {
                    item = makeArrayToParams(item);
                } else if (isObject(item)) {
                    item = makeObjectToParams(item);
                } else {
                    item = encode(item);
                }
                ret.push(key + '=' + item);
            }
        }
        return ret.join('&');
    }

    function makeArrayToParams (data) {
        var i = 0, j = data.length, ret = [];
        for (; i < j; i++) {
            var item = data[i];
            if (isArray(item)) {
                item = makeArrayToParams(item);
            } else if (isObject(item)) {
                item = makeObjectToParams(item);
            } else {
                item = encode(item);
            }
            ret.push(item);
        }
        return ret.join(',');
    }

    if (isArray(data)) {
        ret.push(makeArrayToParams(data));
    } else if (isObject(data)) {
        ret.push(makeObjectToParams(data));
    } else {
        ret.push(encode(data));
    }
    return ret.join('&');
}

function extend () {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i      = 1,
        length = arguments.length,
        deep   = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;

        // skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (i === length) {
        /* jshint ignore:start*/
        target = this;
        /* jshint ignore:end*/
        i--;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        /* jshint -W041 */
        if ((options = arguments[i]) != null) {
            // Extend the base object
            /* jshint -W089 */
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src: [];

                    } else {
                        clone = src && isPlainObject(src) ? src: {};
                    }

                    // Never move original objects, clone them
                    target[name] = extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}

/**
 *
 * @param {array | object} arr
 * @param {Function} cbFunc
 */
function each (arr, cbFunc) {
    if (!arr) {
        return;
    }
    var i, item, ret, len  = arr.length,
        isArrayOrArguments = (arr.splice || arr.callee) instanceof Function;

    if (!isNaN(len) && isArrayOrArguments) {
        for (i = 0; i < len; i++) {
            item = arr[i];
            ret = cbFunc.call(null, item, i, arr);
            if (false === ret) {
                break;
            }

        }
    } else {
        /* jshint ignore:start*/
        for (var p in arr) {
            item = arr[p];
            ret = cbFunc.call(null, item, p, arr);
            if (false === ret) {
                break;
            }
        }
        /* jshint ignore:end*/
    }
}

/**
 * merge数据，将dest中得属性拷贝到origin中，array不拷贝
 * @param {object} origin 源对象
 * @param {object} dest 拷贝对象
 */
function merge (origin, dest) {
    if (undef === dest) {
        return origin;
    }
    var type, dtype, item;
    origin = origin || {};
    if (dest instanceof Array) {
        return [];
    }
    for (var p in dest) {
        if (!dest.hasOwnProperty(p)) {
            continue;
        }
        item = dest[p];
        type = typeof origin[p];
        dtype = typeof dest[p];
        if ('object' === type) {
            origin[p] = merge(origin[p], dest[p]);
        } else {
            if (undef === origin[p] && undef !== item) {
                origin[p] = dtype === 'object' ? merge({}, item): item;
            }
        }
    }
    return origin;
}

function empty () {return;}


function isStandardLink (url, arrProtocol) {
    for (var i = 0, j = arrProtocol.length; i < j; i++) {
        var protocol = arrProtocol[i] + '://';
        if (url.indexOf(protocol) === 0) {
            return true;
        }
    }

    return false;
}

/**
 * 生成Cli显示文档
 *
 * @returns {*}
 */
function hereDoc () {
    var text = '';
    switch (arguments.length) {
        case 0:
            throw Error('需要至少提供一个参数。');
        case 1:
        default :
            var param = arguments[0];

            switch (typeof arguments[0]) {
                case 'function':
                    text = param.toString();
                    break;
                case 'string':
                    text = param;
                    break;
                default :
                    throw Error('传递参数类型仅允许function以及string。');
            }
            return text.replace(/^[^\{]*\{\s*\/\*!|\*\/([\S\s]*?).+\}$/g, '');
    }
}


module.exports = {
    'type'           : type,
    'is'             : {
        'object'      : isObject,
        'string'      : isString,
        'array'       : isArray,
        'func'        : isFunction,
        'undefined'   : isUndefined,
        'numeric'     : isNumeric,
        'contain'     : contain,
        'startWith'   : startWith,
        'endWith'     : endWith,
        'plainObject' : isPlainObject
    },
    'trim'           : trim,
    'toString'       : toString,
    'extend'         : extend,
    'merge'          : merge,
    'domain'         : {
        'getHost'   : getHost,
        'getCookie' : getCookie
    },
    'parseParams'    : parseParams,
    'getParams'      : urlParamParser,
    'each'           : each,
    'empty'          : empty,
    'isStandardLink' : isStandardLink,
    'hereDoc'        : hereDoc
};
