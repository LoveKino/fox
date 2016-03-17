/* eslint strict: 0 */
'use strict';

import flow from 'noflow';
import nokit from 'nokit';
import bodyParser from 'body-parser';

const proxy = nokit.require('proxy');

import userApi from '../api/user';
import caseApi from '../api/case';

export default function (actionType) {
    const flowApp = flow();

    switch (actionType) {
        case 'start':
            flowApp.push(
                proxy.midToFlow(bodyParser.json()),

                proxy.select(
                    {
                        url     : proxy.match('/user/:action'),
                        method  : 'POST',
                        headers : {
                            'content-type' : /application\/json/i
                        }
                    }, $ => $.body = userApi($.url.action.replace(/\.json/, ''), $.req.body)
                ),

                proxy.select(
                    {
                        url     : proxy.match('/case/:action'),
                        method  : 'POST',
                        headers : {
                            'content-type' : /application\/json/i
                        }
                    }, $ => $.body = caseApi($.url.action.replace(/\.json/, ''), $.req.body)
                ),

                proxy.select({url : '/'}, proxy.static('./app'))
            );

            flowApp.listen(8000);
            break;
        case 'stop':
            flowApp.close();
            break;
        default:
            throw new Error('unknown server command.');
            break;
    }
}
