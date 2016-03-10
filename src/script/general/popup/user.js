/** data util **/
var localForage = require('localforage');
var DataBus = localForage.createInstance(
    {
        driver      : localForage.INDEXEDDB,
        name        : 'user',
        storeName   : 'default',
        description : 'user暂存数据库。'
    }
);
/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/user]';
var errorHandle = require('../../common/error-handle');

module.exports = {
    'getUserData' : function () {
        /** user login data from local **/
        return DataBus
            .getItem('user')
            .then(function (userData) {
                Debug.info(debugModuleName, '获取用户信息', userData);
                return userData || {'user' : '', 'pass' : ''};
            }).catch(errorHandle.storage);
    },
    'login'       : function (user, pass) {
        return DataBus
            .setItem('user', {'user' : user, 'pass' : pass})
            .then(DataBus.getItem('user'))
            .then(function (userData) {
                return userData.user && userData.pass;
            }).catch(errorHandle.storage);
    },
    'logout'      : function () {
        return DataBus
            .removeItem('user')
            .then(DataBus.getItem('user'))
            .then(function (userData) {
                return !(userData.user || userData.pass);
            }).catch(errorHandle.storage);
    }
};
