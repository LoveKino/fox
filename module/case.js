var user = require('./user');
var util = require('../common/util');
var fs = require('fs');
var path = require('path');

/**
 * 获取用例列表
 * @param data
 * @returns {*}
 */
function list (data) {
    if (user('authenticate', data).status === 'success') {
        var workPath = util.getUsrPath(data);
        var fileList = fs.readdirSync(workPath.baseUsrDir);

        var result = {
            user : workPath.baseUsrDir.split('/').pop(),
            list : []
        };

        for (var i = 0, j = fileList.length; i < j; i++) {
            if (fileList[i].substr(fileList[i].lastIndexOf('.profile')) !== '.profile') {
                result.list.push(fileList[i]);
            }
        }

        console.log('fetch user case list', result);
        return result;
    } else {
        console.log('fetch user case list failed');
        return false;
    }
}


function save (data) {
    if (user('authenticate', data).status === 'success') {
        var workPath = util.getUsrPath(data);

        var currentSubDir = workPath.baseUsrDir + '/' + (new Date - 0) + '/';
        if (!util.isExists(currentSubDir)) fs.mkdirSync(currentSubDir);

        var filePath = currentSubDir + 'index.js';
        fs.appendFileSync(filePath, data.data);

        var result = util.isExists(filePath);
        if (result) {
            var cmd = require('./cmd');
            cmd.job({
                'argv' : path.resolve(filePath),
                'dir'  : path.resolve(currentSubDir),
                'cwd'  : path.resolve(currentSubDir)
            })
        }

        console.log('save user file', result);
        return result;
    } else {
        console.log('save user file failed');
        return false;
    }
}

module.exports = function (method, data) {
    var action = method.replace(/\.json$/, '');

    var signal = null;
    switch (action) {
        case 'list':
            signal = list(data);
            break;
        case 'save':
            signal = save(data);
            break;
    }

    return {'status' : (!!signal ? 'success': 'fail'), data : signal};
};