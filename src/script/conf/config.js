/**
 * Global Config
 */

var DOMAIN_LIST = {
//    'MAIN'    : {// POST API
//        'DOMAIN' : '0.1.fox.pantimos.com',
//        'PORT'   : 2333
//    },
    'MAIN'    : {// POST API
        'DOMAIN' : '127.0.0.1',
        'PORT'   : 8000
    },
    'WEBSITE' : {
        'DOMAIN' : '0.1.fox.pantimos.com',
        'PORT'   : 80
    },
    'BACKUP'  : {
        'DOMAIN' : '127.0.0.1',
        'PORT'   : 8000
    }
};

var host = '//';
var protocol = 'http:';
var METHOD_POST = 'POST';

var API = {
    /**
     * save case
     */
    'saveCase' : {
        uri  : protocol + host + DOMAIN_LIST.MAIN.DOMAIN + ':' + DOMAIN_LIST.MAIN.PORT + '/case/save.json',
        type : METHOD_POST
    },
    'listCase' : {
        uri  : protocol + host + DOMAIN_LIST.MAIN.DOMAIN + ':' + DOMAIN_LIST.MAIN.PORT + '/case/list.json',
        type : METHOD_POST
    },
    'register' : {
        uri  : protocol + host + DOMAIN_LIST.MAIN.DOMAIN + ':' + DOMAIN_LIST.MAIN.PORT + '/user/register.json',
        type : METHOD_POST
    }
};

var ACTION_MAP_MOUSE = {
    'click'       : '单击',
    'dblclick'    : '双击',
    'mousedown'   : '鼠标按下',
    'mouseup'     : '鼠标弹起',
    'mouseover'   : '鼠标划过',
    'mousemove'   : '鼠标移动',
    'mouseenter'  : '鼠标进入',
    'mouseleave'  : '鼠标离开',
    'mousewheel'  : '滚动滚轮',
    'wheel'       : '滚轮',
    'contextmenu' : '右键菜单'
};

var ACTION_MAP_TOUCH = {
    'touchstart'  : '开始触摸',
    'touchmove'   : '触摸移动',
    'touchend'    : '结束触摸',
    'touchcancel' : '取消触摸'
};

var ACTION_MAP_KEYBOARD = {
    'keypress' : '键入',
    'keydown'  : '按键按下',
    'keyup'    : '按键弹起',
    'input'    : '输入'
};

var ACTION_MAP_BROWSER = {
    'open'                 : '打开页面',
    'reload'               : '刷新页面',
    'set-viewport'         : '使用视区',
    'send-request-headers' : '设置请求头'
};

var ACTION_MAP_SYSTEM = {
    'screenshot' : '截图'
};

var ACTION_MAP_USER = {
    'copy' : '复制'
};

var ACTION_MAP_CONTROL = {
    'resize' : '调整尺寸',
    'scroll' : '滚动',
    'zoom'   : '缩放',
    'focus'  : '焦点',
    'blur'   : '失去焦点',
    'select' : '选择',
    'change' : '发生变化',
    'submit' : '提交表单',
    'reset'  : '重置表单'
};

var CSS_FN_CLASS = {
    'hide' : 'fn-hide'
};


/**
 * internal page list
 * @type {{popup: string, background: string}}
 */
var PAGE_LIST = {
    'popup'      : '/page/popup/main.html',
    'background' : '/page/background/main.html'
};


/**
 * get api data by name
 *
 * @param {String} name
 * @param {Object} params
 * @returns {Object|String}
 */
function getApiInfo (name, params) {
    var base = API[name];

    if (!base) {
        return '';
    }

    return {
        uri  : base.uri + (params ? '?' + $.param(params): ''),
        type : base.type
    };
}


module.exports = {
    'ACTION_LIST' : {
        ACTION_MAP_MOUSE    : ACTION_MAP_MOUSE,
        ACTION_MAP_TOUCH    : ACTION_MAP_TOUCH,
        ACTION_MAP_KEYBOARD : ACTION_MAP_KEYBOARD,
        ACTION_MAP_BROWSER  : ACTION_MAP_BROWSER,
        ACTION_MAP_SYSTEM   : ACTION_MAP_SYSTEM,
        ACTION_MAP_USER     : ACTION_MAP_USER,
        ACTION_MAP_CONTROL  : ACTION_MAP_CONTROL
    },
    'PAGE_LIST'   : PAGE_LIST,
    'CSS_LIST'    : CSS_FN_CLASS,
    'DOMAIN_LIST' : DOMAIN_LIST,
    'getApiInfo'  : getApiInfo
};