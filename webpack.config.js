var path = require('path');
//var webpack = require('webpack');


module.exports = {
	devtool: 'eval',
    entry:  './src/index',
    output: {
        path:     path.join(__dirname, 'build'),
        filename: 'incr-regex.js',
        publicPath: '',
        libraryTarget: "var",
        // name of the global var: "Foo"
        library: "iRX",

    },
    module: {
        loaders: [
            {
                test:   /\.js$/,
                loaders: ['babel-loader'],
                exclude: path.join(__dirname , 'src/test'),
                include: path.join(__dirname , 'src'),
          
            }
        ],
    }
};

/*
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