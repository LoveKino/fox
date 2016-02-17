function getFlag () {
    var env = process.env;
    var isProduction = env.NODE_ENV === 'production';
    var enableLint = env.ENABLE_LINT === 'true';
    var enableDebug = env.ENABLE_DEBUG === 'true';

    return {
        isProduction : isProduction,
        enableLint   : enableLint,
        enableDebug  : enableDebug
    };
}


/**
 * 生成Cli显示文档
 *
 * @returns {*}
 */
function hereDoc () {
    var text = '';
    switch (arguments.length) {
        case 2:
            text = arguments[0];
            var echo = arguments[1];
            var ret = hereDoc(text);
            if (echo) {
                console.log(ret);
            } else {
                return ret;
            }
            break;
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

/**
 * 载入项目配置文件
 *
 * @param jsonConfig
 */
function readConfig (jsonConfig) {
    var fs = require('fs');

    try {
        return JSON.parse(fs.readFileSync(jsonConfig || './package.json').toString());
    } catch (e) {
        throw Error('读取配置文件发生错误:' + e);
    }
}


/**
 * 根据配置文件获得项目版本
 *
 * @param jsonConfig
 * @returns {string}
 */
function getProjectVer (jsonConfig) {
    var releaseVersion = '1.0.0';
    var fileVer = loadProjectConfig(jsonConfig);
    if (fileVer.version.match(/\d+\.\d+\.\d+/)) {
        releaseVersion = fileVer.version;
    }
    return releaseVersion;
}


function joinPath (arrPath) {
    return arrPath.join('/');
}


function appendMinExt (fileName) {
    return fileName.replace(/(\.js)$/i, '.min$1');
}


module.exports = {
    hereDoc       : hereDoc,
    readConfig    : readConfig,
    getProjectVer : getProjectVer,
    joinPath      : joinPath,
    appendMinExt  : appendMinExt,
    getFlag       : getFlag
};