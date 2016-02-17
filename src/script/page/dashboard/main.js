require('../../../style/page/dashboard/main.less');

require('../../general/dashboard/component');

var debugBox = require('../../general/dashboard/debug-box');


function main () {
    debugBox.init();
}

window.addEventListener('load', main);
