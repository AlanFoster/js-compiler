import webpackConfiguration from './webpack';
import _ from 'lodash';

module.exports = function (config) {
  config.set({
    basePath: './..',
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js?(x)'
    ],
    preprocessors: {
      'test/**/*.spec.js': ['webpack']
    },
    singleRun: true,
    webpack: _.extend({}, webpackConfiguration, {
      devTool: 'inline-source-map'
    }),
    webpackServer: {
      noInfo: true
    }
  });
}
