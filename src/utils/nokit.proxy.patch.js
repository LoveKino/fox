/**
 * nokit proxy module patch
 *
 * @desc @吕伟 nokit proxy extend，扩展了请求length的限制，以及自动转换JSON请求为对象的option
 * @param opts
 * @returns {Function}
 */

export default function (opts = {}) {
    const maxLength = opts.maxLength || 0;
    const parseJson = opts.parseJson || false;
    let length = 0;

    return function proxy (ctx) {
        return new Promise(function promise (resolve, reject) {
            var buf;
            buf = new Buffer(0);
            ctx.req.on('data', function data (chunk) {
                if (maxLength) {
                    length += chunk.length;
                    if (length > maxLength) {
                        ctx.res.writeHead(403, {'Content-Type' : ctx.req.headers['content-type']});
                        ctx.res.connection.destroy();
                        ctx.res.end();
                    }
                }
                buf = Buffer.concat([buf, chunk]);
                return buf;
            });
            ctx.req.on('error', reject);
            return ctx.req.on('end', function end () {
                if (buf.length > 0) {
                    ctx.reqBody = buf;
                    if (parseJson && ctx.req.headers['content-type']) {
                        switch (ctx.req.headers['content-type'].toLowerCase()) {
                            case 'application/json':
                                try {
                                    ctx.reqBody = JSON.parse(ctx.reqBody.toString());
                                } catch (e) {
                                    throw e;
                                }
                                break;
                            default :
                                throw new Error('not support content-type.');
                        }
                    }
                }
                return ctx.next().then(resolve, reject);
            });
        });
    };
}
