/**
 * 数据管理
 *
 * @author @soulteary
 * @date 2016.02.24
 * @desc 简单的localStorage数据储存封装
 */

/** debug util **/
var Debug = require('debug.js');
var debugModuleName = '[util/data]';

var backend = localStorage;

var helper = require('helper');

/**
 * Save data to localStorage
 * @param key
 * @param data
 * @param area
 * @returns {boolean}
 */
function save (key, data, area) {
    if (!area) {
        area = '$common';
    }
    Debug.info(debugModuleName, '储存数据:', data, '到:', area, '->', key);

    try {
        var rootKey = loadRootKey(area);
        Debug.info(debugModuleName, '已存在数据:', rootKey);
        rootKey[key] = data;

        var saveData = JSON.stringify(rootKey);
        backend.setItem(area, saveData);
        return backend.getItem(area) === saveData;
    } catch (e) {
        Debug.error(debugModuleName, 'save data error.', e);
        return false;
    }
}

/**
 * Get data from localStorage
 *
 * @param key
 * @param area
 * @notice number will be convert to string
 * @returns {*}
 */
function load (key, area) {
    if (!area) {
        area = '$common';
    }
    var keyDataStr = backend.getItem(area);
    if (keyDataStr !== null) {
        try {
            var result = JSON.parse(keyDataStr);
            if (result.hasOwnProperty(key)) {
                if (helper.is.numeric(result[key])) {
                    return result[key].toString();
                } else {
                    return result[key];
                }
            } else {
                return null;
            }
        } catch (e) {
            Debug.error(debugModuleName, 'get data error.', e);
            return null;
        }
    } else {
        return null;
    }
}

/**
 * Get full key data
 *
 * @notice always return {}
 * @param area
 * @returns {{}}
 */
function loadRootKey (area) {
    if (!area) {
        area = '$common';
    }
    var keyDataStr = backend.getItem(area);
    if (keyDataStr !== null) {
        try {
            var keyData = JSON.parse(keyDataStr);
            if (helper.is.object(keyData)) {
                Debug.error('返回数据:', keyData);
                return keyData;
            } else {
                return {};
            }
        } catch (e) {
            Debug.error(debugModuleName, 'get data error.', e);
            return {};
        }
    } else {
        return {};
    }
}


/**
 * Clear localStorage data
 * @param key
 * @param area
 * @returns {boolean}
 */
function clear (key, area) {
    if (!area) {
        area = '$common';
    }
    if (key) {
        var areaData = loadRootKey(area);
        if (areaData.hasOwnProperty(key)) {
            delete areaData[key];

            var saveData = JSON.stringify(areaData);
            backend.setItem(area, saveData);
            return backend.getItem(area) === saveData;
        } else {
            return false;
        }
    } else {
        backend.clear();
        return !backend.length;
    }
}


module.exports = {
    'save'  : save,
    'load'  : load,
    'clear' : clear
};
