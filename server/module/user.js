var util = require('../common/util');
var fs = require('fs');

/**
 * 创建目录和文件来以供CA使用
 * @param data
 * @returns {boolean}
 */
function register (data) {

    var path = util.getUsrPath(data);
    if (!path) {
        return false;
    }

    if (util.isExists(path.baseUsrDir)) {
        if (util.isExists(path.usrProfile)) {
            console.log('user login success', data);
            return true;
        } else {
            var fileList = fs.readdirSync(path.baseUsrDir);

            for (var i = 0, j = fileList.length; i < j; i++) {
                if (fileList[i].substr(fileList[i].lastIndexOf('.profile')) === '.profile') {
                    console.log('user register failed', data);
                    return false;
                }
            }

            util.writeJson(path.usrProfile, '');
            console.log('user register success', data);
            return true;
        }
    } else {
        try {
            fs.mkdirSync(path.baseUsrDir) &&
            util.writeJson(path.usrProfile, '');
            console.log('user register success', data);
            return true;
        } catch (e) {
            console.log('user register failed', data);
            return false;
        }
    }
}

/**
 * 使用验证目录和文件的方式来做鉴权
 * @param data
 * @returns {*}
 */
function authenticate (data) {

    var path = util.getUsrPath(data);
    if (!path) {
        return false;
    }

    var result = util.isExists(path.baseUsrDir) && util.isExists(path.usrProfile);

    console.log('user authenticate', result);
    return result;
}

module.exports = function (method, data) {
    var action = method.replace(/\.json$/, '');

    var signal = null;
    switch (action) {
        case 'register':
            signal = register(data);
            break;
        case 'login':
        case 'authenticate':
            signal = authenticate(data);
            break;
    }

    return {'status' : (!!signal ? 'success': 'fail')};
};