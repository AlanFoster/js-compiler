import Symbol from './symbol';
import Tokens from './../tokens';
import _ from 'lodash';

const extractValueAndType = function (object) {
  return _.pick(object, 'value', 'type');
};

const literalSymbol = function (type) {
  return new Symbol(type).withNud(extractValueAndType);
};

const prefixSymbol = function(type) {
  const symbol = new Symbol(type);
  return symbol.withNud(function (_token, symbolConsumer) {
    return {
      type,
      right: symbolConsumer.expression(symbol.rbp)
    }
  });
};

const infixSymbol = function(type) {
  const symbol = new Symbol(type);
  return symbol.withLed(function (left, symbolConsumer) {
    return {
      type,
      left,
      right: symbolConsumer.expression(symbol.rbp)
    }
  })
};

const constantSymbol = function (type) {
  return new Symbol(type).withNud(extractValueAndType);
};

const EOFSymbol = function () {
  return new Symbol(Tokens.EOF).withNud(extractValueAndType)
};

export {
  literalSymbol,
  prefixSymbol,
  infixSymbol,
  constantSymbol,
  EOFSymbol
}
