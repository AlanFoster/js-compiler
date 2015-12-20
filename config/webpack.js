module.exports = {
  bail: true,
  output: {
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },
  resolve: {
    extensions: [
      '',
      '.js',
    ],
    modulesDirectories: [
      'src',
      'node_modules'
    ]
  }
};