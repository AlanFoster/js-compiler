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
      }
    ]
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ],
    modulesDirectories: [
      'src',
      'node_modules'
    ]
  }
};
