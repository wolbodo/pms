var path = require('path');
var webpack = require('webpack');
var srcPath = path.join(__dirname, 'app');

module.exports = {
  devtool: 'source-map',
  entry: [
    './app/index.jsx'
  ],
  resolve: {
    root: srcPath,
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules', 'src'],

    alias: {
        'material'     : "../node_modules/react-mdl/extra/material.js",
        'material.css' : "../node_modules/react-mdl/extra/material.css"
        // 'material-icons': "../"
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: ''
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [{
      test: /\.jsx?/,
      loaders: ['babel'],
      include: srcPath
    },{
        test: /\.json$/,
        loader: "json-loader"
    }, {
        test: /\.less$/,
        loader: 'css?sourceMap!less?sourceMap'
    }, {
        test: /\.css$/,
        loader: 'css?sourceMap'
    }, {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, 
        loader: "file" 
    }, { 
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "url-loader?limit=10000&mimetype=application/font-woff" 
    }, {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "file-loader" 
    }]
  }
};
