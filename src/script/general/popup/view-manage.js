/**
 * todo: 重构network & request & toast tips
 */

var Debug = require('debug.js');
var debugModuleName = '[popup/view-manage]';

var util = require('helper');
var view = $('.view-manage');

var Config = require('config');
/** network util **/
var Network = require('network');

/** local user data method for popup **/
var User = require('./user');

/** 时间格式化 **/
var moment = require('moment');
require('moment/locale/zh-cn');

var trTpl = util.hereDoc(function () {
    /*!
     <tr>
     <td class="col-id">%index%</td>
     <td>%date%</td>
     <td><p class="c-name text-overflow">%name%</p></td>
     <td><p class="c-desc text-overflow">%desc%</p></td>
     <td class="col-opt"><a href="%host%%path%" target="_blank">View</a></td>
     </tr>
     */
    return true;
});


function getCaseList () {
    var userData = User.getUserData();
    var user = userData.user;
    var pass = userData.pass;

    if (!(user && pass)) {
        Debug.warn(debugModuleName, '用户尚未登录，使用单机模式。');
        return;
    }

    var html = [];

    // request api to list case
    Network.request('listCase', null, {
        user : user,
        pass : pass
    }, function (resp) {
        if (resp && resp.list && util.is.array(resp.list)) {
            Debug.log(resp.data);
            for (var i = 0, j = resp.list.length; i < j; i++) {
                html.push(trTpl.replace(/%index%/, i + 1)
                        .replace(/%date%/, moment(parseInt(resp.list[i])).format('YYYY/MM/DD h:mm:ss'))
                        .replace(/%name%/, '测试用例' + (i + 1))
                        .replace(/%desc%/, '一个测试用例。')
                        .replace(/%host%/, 'http://' + Config.DOMAIN_LIST.WEBSITE.DOMAIN + ':' + Config.DOMAIN_LIST.WEBSITE.PORT)
                        .replace(/%path%/, '/data/' + resp.user + '/' + resp.list[i] + '/index.html')
                );
            }
        }
        html = html.join('');
        view.find('.case-list tbody').append(html);

    }, function (resp) {
        Debug.info(debugModuleName, 'list case to server fail', resp);
    }, {contentType : 'application/json'});
}

module.exports = {
    init : function () {
        var updateLabel = view.find('.update-time');
        updateLabel.text(updateLabel.attr('data-tpl').replace(/%lastModified%/, moment(new Date() - 0).format('YYYY/MM/DD h:mm:ss')));

        getCaseList();
    }
};

