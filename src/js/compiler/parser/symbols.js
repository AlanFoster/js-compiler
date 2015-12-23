import Symbol from './symbol';
import Tokens from './../tokens';
import _ from 'lodash';

const extractValueAndType = function (object) {
  return _.pick(object, 'type', 'value');
};

const createSymbol = function (type) {
    return new Symbol(type);
};

const literalSymbol = function (type) {
  return createSymbol(type).withNud(extractValueAndType);
};

const prefixSymbol = function(type) {
  const symbol = createSymbol(type);
  return symbol.withNud(function (_token, symbolConsumer) {
    if (symbolConsumer.hasTopToken(Tokens.EOF)) {
      throw new Error('Unexpected end of file');
    }

    return {
      type,
      right: symbolConsumer.expression(symbol.rbp)
    }
  });
};

const infixSymbol = function(type) {
  const symbol = createSymbol(type);
  return symbol.withLed(function (left, symbolConsumer) {
    if (symbolConsumer.hasTopToken(Tokens.EOF)) {
      throw new Error('Unexpected end of file');
    }

    return {
      type,
      left,
      right: symbolConsumer.expression(symbol.rbp)
    }
  })
};

const EOFSymbol = function () {
  return createSymbol(Tokens.EOF).withNud(extractValueAndType)
};

export {
  createSymbol,
  literalSymbol,
  prefixSymbol,
  infixSymbol,
  EOFSymbol
}
