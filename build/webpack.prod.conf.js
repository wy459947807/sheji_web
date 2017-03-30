var config = require('./webpack.base.conf');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

config.output.filename = 'assets/js/[name].[chunkhash:8].js';
config.bail = true;

config.vue.loaders = {
    css: ExtractTextPlugin.extract('style-loader', 'css-loader'),
    sass: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
};

config.module.loaders.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('style', 'css!sass')
});

config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }),
    new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false
        },
        compress: {
            warnings: false
        }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('assets/css/[name].[contenthash:8].css'),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        chunks: ['app', 'vendor'],
        inject: false,
        minify: {
            collapseWhitespace: true,
            preserveLineBreaks: true
        },
        env: {
            production: true
        }
    }),
    new HtmlWebpackPlugin({
        filename: 'landing.html',
        template: 'src/landing.html',
        inject: false,
        chunks: ['landing'],
        imgDir: '/dist/assets/',
        minify: {
            collapseWhitespace: true,
            preserveLineBreaks: true
        },
        env: {
            production: true
        }
    }),
    new HtmlWebpackPlugin({
        filename: 'share.html',
        template: 'src/share.html',
        inject: false,
        chunks: ['share'],
        imgDir: '/dist/assets/',
        minify: {
            collapseWhitespace: true,
            preserveLineBreaks: true
        },
        env: {
            production: true
        }
    })
]);

module.exports = config;
