var getCode = require('helper').hereDoc;
var debug = require('debug.js');
var debugModuleName = '[popup/convert]';

var each = require('helper').each;

function getTemplate (actionList) {
    var template = {
        'set_ua_as_mac'   : function () {/*!
         casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36');
         casper.echo('Set default user-agent as mac.');
         */
            return 1;
        },
        /**
         * set casper waitTimeout
         */
        'set_waitTimeout' : function () {/*!
         casper.options.waitTimeout = 10000;
         casper.echo('Set default waitTimeout as 10000.');
         */
            return 1;
        },
        /**
         * set userAgent
         */
        'set_ua'          : function () {/*!
         casper.userAgent('%UA%');
         casper.echo('Set default user-agent as: %UA%.');
         */
            return 1;
        },
        // todo default viewport
        'set_viewport'    : function () {/*!
         casper.options.viewportSize = {width : '%WIDTH%', height : '%HEIGHT%'};
         casper.echo('Set current viewport size as: %WIDTH% x %HEIGHT%.');
         */
            return 1;
        },
        'capture_page'    : function () {/*!
         casper.waitFor(function check() {
         return this.evaluate(function() {
         return document.querySelectorAll('html,body').length > 0;
         });
         }, function then() {
         this.capture('%CAPTURE_NAME%.png');
         this.echo('capture current page: %CAPTURE_NAME%.png .');
         });
         */
            return 1;
        },
        'init'            : function () {/*!
         var casper = require('casper').create({verbose: true, logLevel: 'warning'});
         casper.echo('capture start...');
         */
            return 1;
        },
        'run'             : function () {/*!
         casper.run();
         */
            return 1;
        },
        'onlyStart'       : function () {/*!
         casper.start('%URL%', headers: {headers: %HEADERS%});
         casper.echo('open url: %URL%');
         */
            return 1;
        },
        'startBegin'      : function () {/*!
         casper.start();
         casper.open('%URL%', {headers: %HEADERS%});
         casper.then(function(){
         this.echo(this.getTitle());
         console.log(this.getCurrentUrl());
         */
            return 1;
        },
        'startEnd'        : function () {/*!
         });
         */
            return 1;
        },
        'thenBegin'       : function () {/*!
         casper.thenOpen('%URL%', {headers: %HEADERS%}, function() {

         this.echo('open new url:'+this.getCurrentUrl());
         this.echo('current page title'+this.getTitle());
         */
            return 1;
        },
        'thenEnd'         : function () {/*!
         });
         */
            return 1;
        },
        'waitForClick'    : function () {/*!
         var %CSS_PATH_VAR_NAME% = '%CSS_PATH%';
         casper.waitForSelector(%CSS_PATH_VAR_NAME%, function() {

         if(this.visible(%CSS_PATH_VAR_NAME%)){

         var self = this;
         this.echo('delay 1s to capture and click.');
         this.wait(1000, function() {
         self.echo('click: %CSS_PATH_VAR_NAME%');
         self.mouseEvent('%EVENT_NAME%', %CSS_PATH_VAR_NAME%);
         self.captureSelector('%CAPTURE_NAME%.png', 'html');
         });

         */
            return 1;
        },
        'waitForSendKeys' : function () {/*!
         var %CSS_PATH_VAR_NAME% = '%CSS_PATH%';
         casper.waitForSelector(%CSS_PATH_VAR_NAME%, function() {

         if(this.visible(%CSS_PATH_VAR_NAME%)){

         var self = this;
         this.echo('delay 1s to capture and send key.');
         this.wait(1000, function() {
         self.echo('send key `%KEY%` : %CSS_PATH_VAR_NAME% and capture.');
         self.sendKeys(%CSS_PATH_VAR_NAME%, '%KEY%');
         self.captureSelector('%CAPTURE_NAME%.png', 'html');
         });

         */
            return 1;
        },
        'closeWaitTag'    : function () {/*!
         }
         });
         */
            return 1;
        }
    };


    if (!actionList.length) {
        throw '没有任何录制内容，无法生成代码。';
    }

    var code = [];
    code.push(getCode(template.init));
    code.push(getCode(template.set_waitTimeout));


    // sign for casper is started
    var startCasper = false;
    var thenBeginTagOpened = false;

    var hasSetDefaultUserAgent = false;
    var openedTagCount = 0;
    var captureId = 0;
    var actionId = 0;

    debug.warn('convert', actionList);
    // set a default ua
    for (var i = 0, j = actionList.length; i < j; i++) {
        var action = actionList[i];
        if (!hasSetDefaultUserAgent && action.category === 'USER::CMD' && action.type === 'visit') {
            code.push(getCode(template.set_ua).replace(/%UA%/g, action.data.ua));
            // remove first viewport set
            actionList.splice(i, 1);
            hasSetDefaultUserAgent = true;
        }
    }
    if (!hasSetDefaultUserAgent) {
        code.push(getCode(template.set_ua_as_mac));
    }

    // store request headers
    var headers = {};
    each(actionList, function (action) {
        if (action.category === 'BROWSER::CMD' && action.type === 'send-request-headers') {
            var headersProcessed = {};
            var headersData = action.data.headers;
            for (var p = 0, q = headersData.length; p < q; p++) {
                if (headersData[p].name && headersData[p].value && headersData[p].name !== 'Accept-Encoding') {
                    headersProcessed[headersData[p].name] = headersData[p].value;
                }
            }
            headers[action.data.url] = JSON.stringify(headersProcessed);
        }
    });

    // covert every action to casperjs code
    each(actionList, function (action) {
        var tpl = '';

        debug.debug(debugModuleName, '将行为解释为代码:', action);
        /**
         * todo fixed order
         *
         * 0 => finish-record
         * 1 => set-viewport
         * 2 => send-request-headers
         * 3 => reload
         * 4 => ...
         */
        //if (!startCasper && action.category !== 'BROWSER::CMD') {
        //    code.push(getCode(template.onlyStart)
        //            .replace('%URL%', action.data.url)
        //            .replace(/%HEADERS%/g, headers[action.data.url] ? headers[action.data.url]: '{}')
        //    );
        //}

        switch (action.category) {
            case 'Mouse':
                code.push(
                    getCode(template.waitForClick)
                        .replace(/%CSS\_PATH%/g, action.cssPath)
                        .replace('%CAPTURE_NAME%', (captureId++) + '_Click')
                        .replace(/%CSS\_PATH\_VAR\_NAME%/g, 'cssPath' + (actionId++))
                        .replace('%EVENT_NAME%', action.type)
                );
                openedTagCount++;
                break;
            case 'Touch':
                break;
            case 'Keyboard':
                if (action.type === 'keypress') {
                    var skip = false;
                    var keyChar = String.fromCharCode(action.event.keyCode);
                    switch (action.event.keyCode) {
                        case 8:
                            skip = true;
                            debug.error(debugModuleName, 'casper暂时不支持发送enter和backspace，稍后完善。');
                            break;
                        case 13:
                            keyChar = '\\r';
                            break;
                        default :
                            break;
                    }
                    if (!skip) {
                        code.push(
                            getCode(template.waitForSendKeys)
                                .replace(/%CSS\_PATH%/g, action.cssPath)
                                .replace(/%CAPTURE\_NAME%/g, (captureId++) + '_SendKeys')
                                .replace(/%CSS\_PATH\_VAR\_NAME%/g, 'cssPath' + (actionId++))
                                .replace(/%KEY%/g, keyChar)
                        );
                        openedTagCount++;
                    }
                }
                break;
            case 'BROWSER::CMD':
                switch (action.type) {
                    case 'open':

                        // close prev open event tags
                        while (openedTagCount) {
                            code.push(getCode(template.closeWaitTag));
                            openedTagCount--;
                        }

                        // close prev then begin tag
                        if (thenBeginTagOpened) {
                            code.push(getCode(template.thenEnd));
                        }

                        if (!startCasper) {
                            tpl = getCode(template.startBegin);
                            startCasper = true;
                        } else {
                            tpl = getCode(template.thenBegin);
                            thenBeginTagOpened = true;
                        }
                        code.push(tpl.replace(/%URL%/g, action.data.url)
                            .replace(/%HEADERS%/g, headers[action.data.url] ? headers[action.data.url]: '{}'));
                        code.push(getCode(template.capture_page).replace(/%CAPTURE\_NAME%/g, (captureId++) + '_open'));

                        break;
                    case 'reload':
                        //TODO,用正常的reload
                        // close prev open event tags
                        while (openedTagCount) {
                            code.push(getCode(template.closeWaitTag));
                            openedTagCount--;
                        }
                        // close prev then begin tag
                        if (thenBeginTagOpened) {
                            code.push(getCode(template.thenEnd));
                        }

                        if (!startCasper) {
                            tpl = getCode(template.startBegin);
                            startCasper = true;
                        } else {
                            tpl = getCode(template.thenBegin);
                            thenBeginTagOpened = true;
                        }
                        code.push(tpl.replace(/%URL%/g, action.data.url)
                            .replace(/%HEADERS%/g, headers[action.data.url] ? headers[action.data.url]: '{}'));
                        code.push(getCode(template.capture_page).replace(/%CAPTURE\_NAME%/g, (captureId++) + '_reload'));
                        break;
                    case 'set-viewport':
                        // todo check if casperjs started
                        code.push(getCode(template.set_viewport).replace(/%WIDTH%/g, action.data.width).replace(/%HEIGHT%/g, action.data.height));
                        if (startCasper) {
                            code.push(getCode(template.capture_page).replace(/%CAPTURE\_NAME%/g, (captureId++) + '_viewport'));
                        }

                        break;
                    case 'send-request-headers':
                        // this data should process first
                        break;
                }

                break;
            case 'SYSTEM::CMD':
                break;
            case 'USER::CMD':
                switch (action.type) {
                    case 'visit':
                        code.push(getCode(template.set_ua).replace(/%UA%/g, action.data.ua));
                        break;
                }
                break;
        }
    });

    while (openedTagCount) {
        code.push(getCode(template.closeWaitTag));
        openedTagCount--;
    }

    // close prev start tags at last
    if (thenBeginTagOpened) code.push(getCode(template.thenEnd));
    if (startCasper) code.push(getCode(template.startEnd));

    code.push(getCode(template.run));

    return code.join('');
}

module.exports = {
    'getCode' : getTemplate
};

