import _ from 'lodash';

const toHash = function (array) {
  return _.chain(array)
          .map(key => [key, key])
          .zipObject()
          .value();
};

const Tokens = toHash([
  'Var',
  'Equals',
  'Semicolon',
  'Identifier',
  'Number',
  'String',
  'ERROR'
]);

export default Tokens;
