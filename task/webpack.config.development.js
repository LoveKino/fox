/* eslint strict: 0 */
'use strict';

const webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
const baseConfig = require('./webpack.config.base');


const config = Object.create(baseConfig);

config.debug = true;

config.devtool = 'cheap-module-eval-source-map';

config.entry = [
    'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
    './src/static/bootstrap.less',
    './src/static/atom-ui.less',
    './src/static/module/welcome.less',
    './src/static/module/tabs.less',
    './src/static/module/status-bar.less',
    './src/static/atom-dark-ui.less',
    './src/static/module/record/index.less',
    './app/index'
];

config.output.publicPath = 'http://localhost:3000/dist/';

/**
 * 如需排除less资源，手动同步资源，可以使用：
 *
 {
     test   : /\.less$/,
     loader : 'style!css!less',
     exclude : /image/
 },
 */
config.module.loaders.push(
    {
        test   : /\.less$/,
        loader : 'style!css!less'
    },

    {
        test    : /^((?!\.module).)*\.css$/,
        loaders : [
            'style-loader',
            'css-loader?sourceMap'
        ]
    },

    {
        test    : /\.module\.css$/,
        loaders : [
            'style-loader',
            'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!'
        ]
    },

    {
        test   : /\.(jpg|jpeg|png|gif|woff)$/i,
        loader : 'file-loader?name=' + 'images/[name].[ext]'
    }
);


config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        '__DEV__'     : true,
        'process.env' : {
            'NODE_ENV' : JSON.stringify('development')
        }
    })
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
