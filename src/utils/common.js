var crypto = require('crypto');
var fs = require('fs');


function md5 (str) {
    var hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
}

function isExists (path) {
    try {
        var stat = fs.statSync(path);
        return stat.isDirectory() || stat.isFile();
    } catch (err) {
        return false;
    }
}

function writeJson (path, data) {
    return fs.appendFileSync(path, JSON.stringify(data));
}

function readJson (path) {
    if (isExists(path)) {
        try {
            return JSON.parse(fs.readFileSync(path));
        } catch (e) {
            return '';
        }
    } else {
        return '';
    }
}

/**
 * 获取用户目录
 * @param data
 * @returns {*}
 */
function getUsrPath (data) {
    if (!data.user || !data.pass) {
        return false;
    } else {
        var baseUsrDir = md5(data.user);
        var usrProfile = [baseUsrDir, md5(data.pass)].join('/') + '.profile';

        return {
            'baseUsrDir' : baseUsrDir,
            'usrProfile' : usrProfile
        };
    }
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

export default {
    'md5'        : md5,
    'isExists'   : isExists,
    'writeJson'  : writeJson,
    'readJson'   : readJson,
    'getUsrPath' : getUsrPath,
    'hereDoc'    : hereDoc
};
