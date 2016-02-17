/** 格式处理 **/
var vsprintf = require('format').vsprintf;
/** 系统判断 **/
var os = require('os');
/** 调试打印 **/
var debug = require('debug.js');
var debugModuleName = '[background/parse-action]';
/** 帮助函数 **/
var helper = require('helper');
/** 配置文件 **/
var config = require('config');
/** 时间格式化 **/
var moment = require('moment');
require('moment/locale/zh-cn');

module.exports = function (records) {
    var newLine = os.windows ? '\r\n': '\n';
    var tab = '\t';
    var result = [];

    helper.each(records, function (record) {
        // TODO : 其他类型的event
        var actionParsed = '';
        switch (record.category) {
            case 'Mouse':
                actionParsed = vsprintf('- 事件:%s%s- 目标:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_MOUSE[record.type], newLine, record.cssPath, newLine, JSON.stringify(record.event), newLine]);
                break;
            case 'Touch':
                actionParsed = vsprintf('- 事件:%s%s- 目标:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_TOUCH[record.type], newLine, record.cssPath, newLine, JSON.stringify(record.event), newLine]);
                break;
            case 'Keyboard':
                actionParsed = vsprintf('- 事件:%s%s- 目标:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_KEYBOARD[record.type], newLine, record.cssPath, newLine, JSON.stringify(record.event), newLine]);
                break;
            case 'Control':
                actionParsed = vsprintf('- 事件:%s%s- 目标:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_CONTROL[record.type], newLine, record.cssPath, newLine, JSON.stringify(record.event), newLine]);
                break;
            case 'BROWSER::CMD':
                actionParsed = vsprintf('- 行为:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_BROWSER[record.type], newLine, JSON.stringify(record.data), newLine]);
                break;
            case 'SYSTEM::CMD':
                actionParsed = vsprintf('- 行为:%s%s- 数据%s%s', [config.ACTION_LIST.ACTION_MAP_SYSTEM[record.type], newLine, JSON.stringify(record.data), newLine]);
                break;
            case 'USER::CMD':
                switch (record.type) {
                    case 'copy':
                        actionParsed = vsprintf('\t行为:%s 目标:%s 数据:%s %s', [config.ACTION_LIST.ACTION_MAP_USER[record.type], record.cssPath, JSON.stringify(record.event), newLine]);
                        break;
                }
                break;
            case 'PLUGIN::CMD':
                switch (record.type) {
                    case 'finish-record':
                        // 始终会至少有一条，但是为防止漏case
                        if (records.length <= 1) {
                            result.push(vsprintf('# 交互脚本录制%s', newLine));
                            result.push(vsprintf('%s亲，似乎你并没有在页面上做任何交互行为，如果是插件问题，请尝试重启插件再试。', tab));
                        } else {
                            result.push(vsprintf('# 交互脚本录制%s', newLine));
                            result.push(vsprintf('## 录制时间 %s [%s - %s]%s', [
                                moment(record.data[0]).format('LL'),
                                moment(record.data[0]).format('h:mm:ss'),
                                moment(record.data[1]).format('h:mm:ss'),
                                newLine
                            ]));
                            actionParsed = vsprintf('## 用户行为详情%s', newLine);
                        }
                        break;
                }
                break;
            default:
                debug.error(debugModuleName, '转换行为并展示，发现暂时不支持的用户行为:', record);
                break;
        }
        result.push(actionParsed);
    });

    return result.join(newLine);
};
