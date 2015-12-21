import base from './karma';
import _ from 'lodash';

module.exports = function (config) {
  base(config);

  config.set({
    singleRun: false
  });
}
