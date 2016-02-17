/** data util **/
var DataBus = require('data');
/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/user]';


module.exports = {
    'getUserData' : function () {
        /** user login data from local **/
        var userData = DataBus.get('user');
        Debug.info(debugModuleName, '获取用户信息', userData);
        return userData || {'user' : '', 'pass' : ''};
    },
    'login'       : function (user, pass) {
        DataBus.set('user', {'user' : user, 'pass' : pass});
        DataBus.save();
        var userData = DataBus.get('user');
        return userData.user && userData.pass;
    },
    'logout'      : function () {
        DataBus.del('user');
        DataBus.save();
        var userData = DataBus.get('user');
        return !(userData.user || userData.pass);
    }
};