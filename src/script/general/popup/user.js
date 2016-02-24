/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/user]';


module.exports = {
    'getUserData' : function () {
        /** user login data from local **/
        var userData = localStorage.getItem('user');
        Debug.info(debugModuleName, '获取用户信息', userData);
        return userData || {'user' : '', 'pass' : ''};
    },
    'login'       : function (user, pass) {
        localStorage.setItem('user', {'user' : user, 'pass' : pass});
        var userData = localStorage.getItem('user');
        return userData.user && userData.pass;
    },
    'logout'      : function () {
        localStorage.removeItem('user');
        var userData = localStorage.getItem('user');
        return !(userData.user || userData.pass);
    }
};