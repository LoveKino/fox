require('../../../style/page/knowledge/main.less');

var helper = require('helper');
var debug = require('debug.js');
var debugModuleName = '[knowledge/main]';


var pageParams = helper.getParams(location.href);

function switchInfo (info) {
    var infoBox = $('.container .box.' + info);
    if (infoBox.length) {
        $('.container .box').hide();
        infoBox.show();
    }
}

if (pageParams.search && pageParams.search.showTopic === 'not-allow-page') switchInfo(pageParams.search.showTopic);

debug.info(debugModuleName, '当前页面参数', pageParams);