var http        = require('http'),
    url         = require('url');

var user = require('../module/user');
var cases = require('../module/case');

/**
 * 启动服务
 * @param options
 */
function start (options) {
    var addr = options.addr || '127.0.0.1',
        port = options.port || '8000',
        dir  = options.dir || 'data';

    var dataBasePath = './' + dir + '/';
    process.chdir(dataBasePath);

    http.createServer(function (request, response) {
        var data = '';

        switch (request.method) {
            case 'POST':
                request.on('data', function (chunk) {
                    data += chunk;
                    // Too much POST data, kill the connection!
                    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                    if (data.length > 1e6) request.connection.destroy();
                });
                request.on('end', function () {
                    var query = '';
                    switch (request.headers['content-type']) {
                        case 'application/json':
                            response.writeHead(200, {'Content-Type' : request.headers['content-type']});
                            query = url.parse(request.url, true);
                            try {
                                data = JSON.parse(data);
                            } catch (e) {
                                data = {};
                            }
                            response.end(makeResponse(query.pathname, data));
                            break;
                        default :
                            request.connection.destroy();
                            break;
                    }
                });
                break;
            default :
                request.connection.destroy();
                break;
        }

    }).listen(port, addr);

    console.log('server start', addr, port);
}

/**
 * 根据不同请求路径选择不同模块
 * @param path
 * @param data
 * @returns {*}
 */
function makeResponse (path, data) {

    var query = path.split('/');
    var module = '';
    var method = '';

    switch (query.length) {
        case 3:
            module = query[1];
            method = query[2];
            switch (module) {
                case 'user':
                    return JSON.stringify(user(method, data));
                case 'case':
                    return JSON.stringify(cases(method, data));
            }
            break;
        default :
            return 'Hi';
    }

}

module.exports = {
    'start' : start
};