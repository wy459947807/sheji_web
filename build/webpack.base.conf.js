var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/main.js',
        vendor: ['vue', 'vue-router', 'vue-resource', 'jquery', 'yaqrcode', './src/libs/city-selector.js', './src/libs/pinyin.js', './src/vendor/mobiscroll/mobiscroll.custom-2.16.0.min.js'],
        landing: './src/landing.js',
        share: './src/share.js'
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: 'assets/js/[name].[hash:8].js'
    },
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules|vendor/
        }, {
            test: /\.(png|jpg|svg)$/,
            loader: 'url?limit=7000&name=assets/img/[name].[ext]',
            exclude: /img\/(landing|share)\//
        }, {
            test: /\.(png|jpg|svg)$/,
            loader: 'file?name=assets/img/landing/[name].[ext]',
            include: /img\/landing\//
        }, {
            test: /\.(png|jpg|svg)$/,
            loader: 'file?name=assets/img/share/[name].[ext]',
            include: /img\/share\//
        }]
    },
    vue: {
        autoprefixer: {
            browsers: ['> 5% in CN', 'last 3 versions', 'Android >= 2.3']
        }
    },
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'assets/js/[name].[hash:8].js',
            chunks: ['app', 'vendor']
        })
    ]
};
