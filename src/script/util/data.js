/**
 * 全局共享的Data模块
 *
 * @desc    封装后的数据操作
 * @example
 *
 *      获取默认配置      Data.config();
 *      获取储存配置      Data.config('KeyName');
 *      设置储存配置      Data.config('KeyName', 'value');
 *      储存持久化数据    Data.set('KeyName', 'value'[, 'STORAGE AREA'])
 *      获取持久化数据    Date.get('KeyName'[, 'STORAGE AREA'])
 *      删除持久化数据    Date.del('KeyName'[, 'STORAGE AREA'])
 */

var Config = require('config');
var Util = require('helper');
var LS = require('./localstorage');
var Debug = require('debug.js');

/**
 * 默认储存的键名
 * @type {string}
 */
var defaultKey = 'cache';

/**
 * 用于储存通用数据的对象
 * @type {{}}
 */
var cache = LS.get(defaultKey, {});

/**
 * 配置数据的对象
 * @type {{}}
 */
var config = {};
Debug.info('[data.js]', '加载默认KEY的数据到内存:', cache);

/**
 * 接口对象
 * @constructor
 */
function Data () {
    this.version = '0.0.1';
}

/**
 * 基础数据操作（GET/SET/DEL）
 * 当前数据在内存中的cache
 *
 * @param params
 * @returns {boolean|object}
 */
function data (params) {

    // 不传递任何参数时
    if (!params) {
        return false;
    }

    // 带行为参数时
    if (params.action) {
        // 带key参数时
        if (params.key) {
            switch (params.action) {
                case 'get':
                    return storage(params.type)[params.key];
                case 'set':
                    if (params.value) {
                        storage(params.type)[params.key] = params.value;
                        return storage(params.type)[params.key] === params.value;
                    } else {
                        return false;
                    }
                    break;
                case 'del':
                    if (params.key) {
                        delete storage(params.type)[params.key];
                        return true;
                    } else {
                        return false;
                    }
                    break;
                default :
                    return false;
            }
        } else {
            // 仅有行为参数时
            switch (params.action) {
                case 'get':
                    return storage(params.type);
                case 'set':
                    if (!params.value) {
                        switch (params.type) {
                            case 'config':
                                config = {};
                                break;
                            case 'cache':
                            /* falls through */
                            default :
                                cache = {};
                        }
                    }
            }
        }
    } else {
        // 如果不传递任何参数，输出
        return {
            cache  : cache,
            config : config
        };
    }
}

/**
 * 选择数据储存的对象
 * @param type
 * @returns {{}}
 */
function storage (type) {
    switch (type) {
        case 'config':
            return config;
        case 'cache':
        /* falls through */
        default :
            return cache;
    }
}

/**
 * 获取内存中的对象数据
 * @param {string} key 存储数据key
 * @param {string} stor (config|cache)存储的数据类型，默认为cache
 * @returns {mixed} data key对应的数据
 */
Data.prototype.get = function (key, stor) {
    if (!stor) {
        stor = defaultKey;
    }
    if (key) {
        return data({action : 'get', type : stor, key : key});
    } else {
        return data({action : 'get', type : stor});
    }
};

/**
 * 设置内存中的数据
 * @param {string} key 存储数据key
 * @param {mixed}  val 存储的数据
 * @param {string} stor (config|cache)存储的数据类型，默认为cache
 * @returns {mixed}
 */
Data.prototype.set = function (key, val, stor) {
    var argv = arguments;
    if (argv.length > 1) {
        key = argv[0];
        val = argv[1];
        if (!stor) {
            stor = defaultKey;
        }
        return data({action : 'set', type : stor, key : key, value : val});
    } else {
        return false;
    }
};

/**
 * 清除内存中的数据
 * @param {string} key 存储数据key
 * @param {string} stor (config|cache)存储的数据类型，默认为cache
 * @returns {*}
 */
Data.prototype.del = function () {
    if (arguments.length > 0) {
        var key = arguments[0];
        var stor = defaultKey;

        if (arguments.length === 2) {
            stor = arguments[1];
        }
        return data({action : 'del', type : stor, key : key});
    } else {
        return false;
    }
};

/**
 * 操作配置对象
 * @param {string} key 存储数据key，如果不传，默认get所有配置
 * @param {mixed}  val 存储配置，如果不传入默认为get key的配置
 * @returns {*}
 */
Data.prototype.config = function (key, val) {
    var cfgKey = 'config';
    switch (arguments.length) {
        case 2:
            return this.set(key, val, cfgKey);
        case 1:
            return this.get(key, cfgKey);
        case 0:
            return Config;
        default :
            return false;
    }
};

/**
 * 对外暴露对象的save方法
 * 储存后会自动重载内存中的数据
 */
Data.prototype.save = function (storageArea, overwrite) {
    var stor = storageArea || defaultKey;
    if (overwrite) {
        Debug.info('覆盖之前储存的数据。');
        LS.set(stor, cache);
    } else {
        var target = LS.get(stor) || {};
        LS.set(stor, Util.extend(true, target, cache));
    }
    this.load();
};

/**
 * 对外暴露对象的load方法
 * @returns {*}
 */
Data.prototype.load = function (storageArea) {
    var stor = storageArea || defaultKey;

    cache = LS.get(stor, {});
    Debug.info('重新加载缓存的数据:', cache);
    return LS.get(stor, {});
};

Data.prototype.storage = LS;

module.exports = new Data();
