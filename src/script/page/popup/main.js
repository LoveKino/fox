/** the style of popup page. **/
require('../../../style/page/popup/main.less');

/** global config **/
var Config = require('config');
/** data util **/
var DataBus = require('data');
/** common message communication **/
var Message = require('../../common/message');
/** CodeMirror:javascript && markdown **/
var CodeMirror = require('codemirror');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/continuelist');
require('codemirror/addon/comment/continuecomment');
require('codemirror/addon/comment/comment');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/xml/xml');
/** jsBeautify **/
var Beautify = require('js-beautify');
/** chrome toolbar plugin icon **/
var BrowserIcon = require('../../common/browser-icon');
/** convert user action record to code **/
var Convert = require('../../general/popup/convert');
/** network util **/
var Network = require('network');

/** codeMirror instance **/
var cmCodeBox = null;
var cmLogBox = null;
/** keep cm instance which hidden refresh once **/
var cmCodeBoxHasRefresh = false;
/** timer handle for notice banner**/
var handleNoticeBanner = null;

/** debug util **/
var Debug = require('debug.js');
/** current module name for debug util **/
var debugModuleName = '[popup/main]';
/** local user data method for popup **/
var User = require('../../general/popup/user');

/** user view **/
var viewUser = require('../../general/popup/view-user');
/** user manage **/
var viewManage = require('../../general/popup/view-manage');


function loadData (keyStore, callback) {
    DataBus.load();
    var response = DataBus.get(keyStore);
    if (response) {
        return callback(response);
    } else {
        return callback(null);
    }
}

loadData('records', function (data) {
    Debug.info(debugModuleName, '加载本次持久化数据:', data);
    cmLogBox = CodeMirror($('.view-item.view-log').get(0), {
        'theme'           : 'mdn-like',
        'mode'            : 'markdown',
        'lineNumbers'     : true,
        'styleActiveLine' : true,
        'matchBrackets'   : true,
        'lineWrapping'    : true,
        'readOnly'        : true,
        'value'           : data
    });
    cmLogBox.setSize('100%', 500);
});

loadData('originRecords', function (data) {
    if (data && data.length <= 1) {
        $('.btn-groups .btn[data-tab=code]').addClass(Config.CSS_LIST.hide);
        return;
    }
    var code = Convert.getCode(data);

    var codeFormated = Beautify(code, {
        'indent_size'              : 2,
        'indent_char'              : ' ',
        'max_preserve_newlines'    : 1,
        'preserve_newlines'        : true,
        'keep_array_indentation'   : true,
        'break_chained_methods'    : true,
        'indent_scripts'           : true,
        'brace_style'              : true,
        'space_before_conditional' : true,
        'unescape_strings'         : true,
        'jslint_happy'             : false,
        'end_with_newline'         : true,
        'wrap_line_length'         : true,
        'indent_inner_html'        : true,
        'comma_first'              : false,
        'e4x'                      : true
    });


    // save result to local
    var caseList = DataBus.get('list', 'case-list');
    if (caseList) {
        caseList.push(codeFormated);
    } else {
        caseList = [codeFormated];
    }
    DataBus.set('list', caseList, 'case-list');
    DataBus.save('case-list');

    cmCodeBox = CodeMirror($('.view-item.view-code').get(0), {
        'theme'           : 'monokai',
        'mode'            : 'javascript',
        'lineNumbers'     : true,
        'styleActiveLine' : true,
        'matchBrackets'   : true,
        'lineWrapping'    : true,
        'value'           : codeFormated
    });
    cmCodeBox.setSize('100%', 500);

    var userData = User.getUserData();
    var user = userData.user;
    var pass = userData.pass;

    if (!(user && pass)) {
        Debug.warn(debugModuleName, '用户尚未登录，使用单机模式。');
        return;
    }

    // request api to save case
    Network.request('saveCase', null, {
        user : user,
        pass : pass,
        data : codeFormated
    }, function (resp) {
        if (resp && resp.status === 'success') {
            Debug.info(debugModuleName, 'case to server success');
        }
    }, function (resp) {
        Debug.info(debugModuleName, 'case to server fail', resp);
    }, {contentType : 'application/json'});

});

viewUser.init();
viewManage.init();

$('.btn-groups').delegate('.btn', 'click', function (e) {
    e.preventDefault();
    var btn = $(e.target);
    var tabName = btn.data('tab');
    var tab = $('.view-' + tabName);
    if (tab.length) {
        tab.addClass('view-actived').removeClass(Config.CSS_LIST.hide).siblings().addClass(Config.CSS_LIST.hide).removeClass('view-actived');
        btn.addClass('btn-active').siblings().removeClass('btn-active');

        clearTimeout(handleNoticeBanner);
        handleNoticeBanner = setTimeout(function () {
            $('.notice-banner .view-actived').removeClass('view-actived');
        }, 5000);

        switch (tabName) {
            case 'code':
                if (!cmCodeBoxHasRefresh) {
                    cmCodeBox.refresh();
                    cmCodeBoxHasRefresh = true;
                }
                cmCodeBox.focus();
                break;
            case 'log':
                cmLogBox.focus();
                break;
            case 'user':
                break;
        }
    }
});

setTimeout(function () {
    $('.notice-banner .view-actived').removeClass('view-actived');
}, 5000);


var btnRestartPlugin = $('.btn-restart-plugin');
btnRestartPlugin.on('click', function (e) {
    e.preventDefault();

    //todo 这里期望能在响应消息后重载
    Message.sendMessageFromBackground({'APP:MSG' : 'RELOAD-PLUGIN'}, function (resp) {
        Debug.info(debugModuleName, '用户点击插件栏重载插件按钮，发送消息:', resp);
    });

    BrowserIcon.reset();
    DataBus.del('originRecords');
    DataBus.del('records');
    DataBus.save();

    chrome.runtime.reload();
    window.close();

});
