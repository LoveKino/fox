const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const nokit = require('nokit');

const log = console.log.bind(console);

var chokidar = require('chokidar');
var baseDir = path.resolve(__dirname, '../src');
var distDir = path.resolve(__dirname, '../app');

const babelWatchFileType = ['.js', '.jsx'];
const ignoreDirs = [
    path.join(baseDir, 'static')
];

var watcher = chokidar.watch(baseDir, {
    ignored    : [/[\/\\]\./, '*.*___jb_old___', '*.*___jb_bak___'],
    persistent : true
});

function syncFile (src, dest) {
    function sync (from, to) {
        exec(`cp -f ${from} ${to}`);
        log(`sync ${from} ${to}`);
    }

    fs.stat(src, (err, stats) => {
        if (err) {
            console.log('sync error, retry', src);
            (function deferSync (from, to) {
                setTimeout(function defer () {
                    sync(from, to);
                }, 300);
            })(src, dest);
        } else {
            if (stats.isFile() && fs.statSync(src)) {
                sync(src, dest);
            } else {
                log('ignore dir, sync dir need manual run cli `npm run build`');
            }
        }
    });
}

function inDirsList (src, opt) {
    return opt.some(dir => src.indexOf(dir) === 0);
}


watcher
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', () => {
        log('watch server list:');
        log(watcher.getWatched());
    })
    .on('change', (filePath, stats) => {
        if (stats) {
            log(`File ${filePath} changed size to ${stats.size}`);
        } else {
            log(`File ${filePath} changed`);
        }

        var webpackWatchedDir = [
            path.join(baseDir, 'actions'),
            path.join(baseDir, 'components'),
            path.join(baseDir, 'containers'),
            path.join(baseDir, 'reducers'),
            path.join(baseDir, 'store')
        ];

        if (
            !inDirsList(filePath, webpackWatchedDir) &&
            babelWatchFileType.indexOf(path.extname(filePath)) > -1
        ) {
            exec(`./node_modules/.bin/babel ${filePath} --out-file ${filePath.replace(baseDir, distDir)}`, (err, stdout) => {
                if (err) {
                    nokit.err(`build error: ${err} ; file path: ${filePath} ; stdout: ${stdout}`)
                } else {
                    log(`[babel compile done] ${filePath.replace(baseDir, distDir)}`);
                }
            });
        } else {
            if (!inDirsList(filePath, ignoreDirs)) {
                syncFile(filePath, filePath.replace(baseDir, distDir));
            }
        }
    });
