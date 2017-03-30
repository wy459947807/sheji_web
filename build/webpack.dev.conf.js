var config = require('./webpack.base.conf');
var HtmlWebpackPlugin = require('html-webpack-plugin');

config.devtool = '#eval-source-map';

config.output.publicPath = '/';

config.module.loaders.push({
    test: /\.scss$/,
    loaders: ["style", "css", "sass"]
});

config.plugins = (config.plugins || []).concat([
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        chunks: ['app', 'vendor'],
        inject: false,
        env: {
            development: true
        }
    }),
    new HtmlWebpackPlugin({
        filename: 'landing.html',
        template: 'src/landing.html',
        inject: false,
        chunks: ['landing'],
        imgDir: '',
        env: {
            development: true
        }
    }),
    new HtmlWebpackPlugin({
        filename: 'share.html',
        template: 'src/share.html',
        inject: false,
        chunks: ['share'],
        imgDir: '',
        env: {
            development: true
        }
    })
]);

module.exports = config;
