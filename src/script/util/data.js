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
var Debug = require('debug.js');

var localForage = require('localforage');

var cache = {};

var DataBus = function (name, desc) {
    return new DataBus.fn.init(name, desc);
};

DataBus.fn = DataBus.prototype = {
    version     : '0.0.1',
    constructor : DataBus
};

DataBus.extend = DataBus.fn.extend = function () {
    var options;
    var name;
    var copy;
    var target = this;

    if ((options = arguments[0]) !== null) {
        for (name in options) {
            if (options.hasOwnProperty(name)) {
                copy = options[name];
                if (target === copy) continue;
                if (copy !== undefined) target[name] = copy;
            }
        }
    }
    return target;
};

var init = DataBus.fn.init = function (name, description) {
    cache[name] = {
        'config'   : {
            driver      : localForage.INDEXEDDB,
            name        : name,
            storeName   : 'default',
            description : description || ''
        }
    };

    var setItem = DataBus.fn.set = DataBus.fn.setItem = function () {
        var storeName = arguments[0];
        var argv = Array.prototype.slice.call(arguments, 1);
        var inst = localForage.createInstance(cache[storeName].config);
        return inst.setItem.apply(cache[storeName].instance, argv);
    }.bind(undefined, name);
    setItem.prototype = DataBus.fn;

    var getItem = DataBus.fn.get = DataBus.fn.getItem = function () {
        var storeName = arguments[0];
        var argv = Array.prototype.slice.call(arguments, 1);
        var inst = localForage.createInstance(cache[storeName].config);
        Debug.info(inst.getItem.apply(cache[storeName].instance, argv),111122);
        return inst.getItem.apply(cache[storeName].instance, argv);
    }.bind(this, name);
    getItem.prototype = DataBus.fn;

    var removeItem = DataBus.fn.del = DataBus.fn.removeItem = function () {
        var storeName = arguments[0];
        var argv = Array.prototype.slice.call(arguments, 1);
        cache[storeName].instance = cache[storeName].instance || localForage.createInstance(cache[storeName].config);
        return cache[storeName].instance.removeItem.apply(cache[storeName].instance, argv);
    }.bind(undefined, name);
    removeItem.prototype = DataBus.fn;

    var clear = DataBus.fn.clear = function () {
        var storeName = arguments[0];
        var argv = Array.prototype.slice.call(arguments, 1);
        cache[storeName].instance = cache[storeName].instance || localForage.createInstance(cache[storeName].config);
        return cache[storeName].instance.clear.apply(cache[storeName].instance, argv);
    }.bind(undefined, name);
    clear.prototype = DataBus.fn;

    return this;
};
init.prototype = DataBus.fn;

module.exports = DataBus;
