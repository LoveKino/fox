/* eslint strict: 0 */
'use strict';


const flow = require('noflow');
const nokit = require('nokit');
const proxy = nokit.require('proxy');

let flowApp = flow();

const userApi = require('../api/user');
const caseApi = require('../api/case');

proxy.body = require('./nokit.proxy.patch');

export default function (actionType) {
    switch (actionType) {
        case 'start':
            flowApp.push(
                proxy.body({maxLength : 1e6, parseJson : true}),    // 1MB
                proxy.select({
                        url     : proxy.match('/user/:action'),
                        method  : 'POST',
                        headers : {
                            'content-type' : /application\/json/i
                        }
                    }, $ => $.body = userApi($.url.action.replace(/\.json/, ''), $.req)
                ),
                proxy.select({
                        url     : proxy.match('/case/:action'),
                        method  : 'POST',
                        headers : {
                            'content-type' : /application\/json/i
                        }
                    }, $ => $.body = caseApi($.url.action.replace(/\.json/, ''), $.req)
                ),
                proxy.select({url : '/'}, proxy.static('./app'))
            );

            flowApp.listen(3001);
            break;
        case 'stop':
            flowApp.close();
            break;
        default:

            break;
    }
}
