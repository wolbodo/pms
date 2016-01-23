'use strict';

var webpack = require('webpack'),  
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    path = require('path'),
    srcPath = path.join(__dirname, 'app');

module.exports = {
    target: 'web',
    cache: true,
    entry: {
        server: 'webpack/hot/only-dev-server',
        client: 'webpack-dev-server/client?https://pms.zaphod',
        // client: 'webpack-dev-server/client?http://localhost:8090',
        module: path.join(srcPath, 'index.jsx'),
        common: ['react', 'react-router']
    },
    output: {
        filename: '[name].js', 
        path: path.join(__dirname, 'build'),
        publicPath: '',
        pathInfo: true
    },
    module: {
        loaders: [
            { 
                test: /\.jsx$/,
                include: path.join(__dirname, "app"),
                exclude: /(node_modules|bower_components)/,
                loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-1,cacheDirectory=true'],
            }, {
                test: /\.json$/,
                loader: "json-loader"
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css?sourceMap!' + 'less?sourceMap')
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css?sourceMap')
            }, {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, 
                loader: "file" 
            }, { 
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
                loader: "url-loader?limit=10000&mimetype=application/font-woff" 
            }, {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
                loader: "file-loader" 
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        new HtmlWebpackPlugin({
            inject: 'head',
            template: 'app/index.html',
            favicon: 'app/favicon.png'
        }),
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        root: srcPath,
        modulesDirectories: ['node_modules', 'src'],
        extensions: ['', '.js', '.jsx'],

        alias: {
            'material'     : "../node_modules/react-mdl/extra/material.js",
            'material.css' : "../node_modules/react-mdl/extra/material.css"
            // 'material-icons': "../"
        }
    },

    debug: true,
    devtool: 'source-map',
    devServer: {
        contentBase: './build',
        historyApiFallback: true
    }
}
