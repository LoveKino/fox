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


module.exports = {
    'getUserData' : function () {
        /** user login data from local **/
        var userData = DataBus.getItem('user');
        Debug.info(debugModuleName, '获取用户信息', userData);
        return userData || {'user' : '', 'pass' : ''};
    },
    'login'       : function (user, pass) {
        DataBus.setItem('user', {'user' : user, 'pass' : pass});
        var userData = DataBus.getItem('user');
        return userData.user && userData.pass;
    },
    'logout'      : function () {
        DataBus.removeItem('user');
        var userData = DataBus.getItem('user');
        return !(userData.user || userData.pass);
    }
};
