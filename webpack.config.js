var path = require('path');
var webpack = require('webpack');
var TerserPlugin = require('terser-webpack-plugin');


module.exports = {
//	devtool: 'eval',
    mode: 'production',
    entry:  './src/index',
    output: {
        path:     path.join(__dirname, 'build'),
        filename: 'incr-regexp.js',
        publicPath: '',
        libraryTarget: "var",
        // name of the global var: "Foo"
        library: "iRX",

    },
    module: {
        rules: [
            {
                test:   /\.js$/,
                exclude: [path.join(__dirname , "node_modules"),path.join(__dirname , 'src/test'), path.join(__dirname , 'lib')],
                use: {
                  loader: 'babel-loader',
                  query: {
                      presets: ['@babel/env']
                  }
                }
            }
        ],
    },

    optimization: {
      minimize: true

    } 
};

/*
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
                  compress: {
                      warnings: false
                  },
                  output: {comments: false}
              })
    ],
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false, // Must be set to true if using source-maps in production
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          }
        }),
      ],
module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.UglifyJsPlugin({
                  compress: {
                      warnings: false
                  },
                  output: {comments: false}
              })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.css$/, // Only .css files
      loader: 'style!css' // Run both loaders
    }]
  }
};

babel-loader
*/