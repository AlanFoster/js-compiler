module.exports = {
  output: {
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass?config=otherSassLoaderConfig']
      }
    ]
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
      '.scss'
    ],
    modulesDirectories: [
      'src/js',
      'node_modules'
    ]
  }
};
