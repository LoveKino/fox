var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var page = require('./page');

function job (params) {
    var ps = spawn('casperjs', [params.argv], {cwd : params.cwd});
    ps.stdout.on('data', function stdout (data) {
        console.log('stdout: ' + data);
    });
    ps.stderr.on('data', function stderr (data) {
        console.log('stderr: ' + data);
    });
    ps.on('close', function close (code) {
        if (code === 0) {
            var baseDir = path.dirname(ps.spawnargs[1]);
            var fileList = fs.readdirSync(baseDir);

            var snapshots = [];
            for (var i = 0, j = fileList.length; i < j; i++) {
                if (fileList[i].substr(fileList[i].lastIndexOf('.png')) === '.png') {
                    snapshots.push(fileList[i]);
                }
            }
            console.log('获取截取图片列表', snapshots);

            var relativeDir = baseDir.split('/server/data/')[1];
            var date = relativeDir.split('/')[1];

            var html = page.generate({
                snapshots : snapshots,
                script    : 'index.js',
                path      : relativeDir,
                date      : date
            });

            fs.appendFileSync(baseDir + '/index.html', html);
            console.log('保存要写入文件', html);
        }
        console.log('child process exited with code ' + code);
    });
    ps.on('error', function error (err) {
        console.log('Failed to start child process.', err);
    });
}


module.exports = {
    job : job
};
