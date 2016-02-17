var path = require('path');
var fs = require('fs');

var webpack = require('webpack');

var StringReplacePlugin = require("string-replace-webpack-plugin");

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var isProduction = process.env.NODE_ENV === 'production';

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var srcDir = path.resolve(process.cwd(), 'src');
var distDir = path.resolve(process.cwd(), 'dist');

var sourceMap = require(path.resolve(srcDir, 'conf/file-map.json'));

var excludeFromStats = [
    /node_modules[\\\/]/
];

function genEntries () {
    var scriptBasePageDir = path.resolve(srcDir, 'script/page');
    var scriptDirList = fs.readdirSync(scriptBasePageDir);

    var result = {};

    var gutil = require('gulp-util');

    scriptDirList.forEach(function (name) {
        var curPath = path.resolve(scriptBasePageDir, name);
        if (fs.statSync(curPath).isDirectory()) {

            var subDirList = fs.readdirSync(curPath);
            subDirList.forEach(function (subName) {
                var fileName = subName.match(/(.+)\.js$/);
                fileName = fileName ? fileName[1]: '';
                if (fileName) {
                    result[curPath.split('/').pop()] = path.resolve(curPath, subName);
                }
            });
        }
    });

    gutil.log('result', result);
    return result;
}


function makeConf (options) {
    options = options || {};

    // 发布模式默认关闭调试
    var debug = !!isProduction;
    // 如果强制指定，那么打开调试
    if (options.debug !== undefined) {
        debug = options.debug;
    }

    var entries = genEntries();
    var chunks = Object.keys(entries);
    var config = {
        entry : entries,

        output : {
            path              : distDir,
            filename          : 'script/' + (debug ? '[name].js': '[name].min.js'),
            jsonpFunction     : 'Modules',
            hotUpdateFunction : 'ModuleHotUpdate',
            pathinfo          : !!debug,
            libraryTarget     : 'umd'
        },

        resolve : {
            root       : [srcDir, './node_modules'],
            alias      : sourceMap,
            extensions : ['', '.js', '.css', '.less', '.scss', '.tpl', '.png', '.jpg']
        },

        resolveLoader : {
            root : path.join(__dirname, 'node_modules')
        },

        module : {
            noParse : ['jQuery'],
            loaders : [
                {test : /\.css$/, loader : 'style!css'},
                {test : /\.scss$/, loader : 'style!css!sass'},
                {test : /\.less$/, loader : 'style!css!less', exclude: /image/},
                {test : /\.styl$/, loader : 'style!css!stylus'},
                /*{
                 test    : /\.(jpe?g|png|gif|svg)$/i,
                 loaders : [
                 'image?{bypassOnDebug: true, progressive:true, \
                 optimizationLevel: 3, pngquant:{quality: "65-80", speed: 4}}',
                 // url-loader更好用，小于10KB的图片会自动转成dataUrl，
                 // 否则则调用f
                 ile
                 -loader，参数直接传入
                 'url?limit=10000&name=img/[hash:8].[name].[ext]'
                 ]
                 },
                 {
                 test   : /\.(woff|eot|ttf)$/i,
                 loader : 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
                 },*/
                {test : /\.(tpl|ejs)$/, loader : 'ejs'}
                //{test : /\.js$/, exclude : /node_modules/, loader : 'jsx'}
            ]
        },

        plugins : [
            // 全局变量
            new webpack.ProvidePlugin({
                '$'             : 'jquery',
                'jQuery'        : 'jquery',
                'window.jQuery' : 'jquery'
            }),
            // 执行性能最优
            new CommonsChunkPlugin({
                name      : 'vendor',
                chunks    : chunks,
                minChunks : chunks.length
            })
        ],

        devServer : {
            stats : {
                cached  : false,
                exclude : excludeFromStats,
                colors  : true
            }
        }
    };

    if (isProduction && !debug) {
        config.module.loaders.push({
            test : /\.js$/, exclude : /node_modules/, loader : StringReplacePlugin.replace({
                replacements : [
                    {
                        pattern     : /debug\.(log|info|warn|debug)\([\S\s]*?\);/ig,
                        replacement : function (match, p1, offset, string) {
                            var gutil = require('gulp-util');
                            gutil.log('去除程序调试信息:', p1, match);
                            return '';
                        }
                    }
                ]
            })
        });
        config.plugins.push(new StringReplacePlugin());
    }

    var cssLoader, sassLoader;

    if (debug) {
        // 开发阶段，css直接内嵌
        cssLoader = {
            test   : /\.css$/,
            loader : 'style!css'
        };
        sassLoader = {
            test   : /\.scss$/,
            loader : 'style!css!sass'
        };

        config.module.loaders.push(cssLoader);
        config.module.loaders.push(sassLoader);
    } else {
        // 编译阶段，css分离出来单独引入
        cssLoader = {
            test   : /\.css$/,
            loader : ExtractTextPlugin.extract('style', 'css?minimize') // enable minimize
        };
        sassLoader = {
            test   : /\.scss$/,
            loader : ExtractTextPlugin.extract('style', 'css?minimize', 'sass')
        };

        config.module.loaders.push(cssLoader);
        config.module.loaders.push(sassLoader);
        config.plugins.push(
            new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
                // 当allChunks指定为false时，css loader必须指定怎么处理
                // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
                // 第一个参数`notExtractLoader`，一般是使用style-loader
                // @see https://github.com/webpack/extract-text-webpack-plugin
                allChunks : false
            })
        );

        // 自动生成入口文件，入口js名必须和入口文件名相同
        // 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
        var pages = fs.readdirSync(srcDir);

        pages.forEach(function (filename) {
            var m = filename.match(/(.+)\.html$/);

            if (m) {
                // @see https://github.com/kangax/html-minifier
                var conf = {
                    template : path.resolve(srcDir, filename),
                    // @see https://github.com/kangax/html-minifier
                    // minify: {
                    //     collapseWhitespace: true,
                    //     removeComments: true
                    // },
                    filename : filename
                };

                if (m[1] in config.entry) {
                    conf.inject = 'body';
                    conf.chunks = ['vendors', m[1]];
                }

                config.plugins.push(new HtmlWebpackPlugin(conf));
            }
        });

        config.plugins.push(new UglifyJsPlugin({
            //https://github.com/gruntjs/grunt-contrib-uglify/issues/366#issuecomment-154488137
            options : {
                'preserveComments' : function (node, comment) {
                    // preserve comments that start with a bang
                    return /^!/.test(comment.value);
                }
            }
        }));
    }

    return config;
}

module.exports = makeConf;