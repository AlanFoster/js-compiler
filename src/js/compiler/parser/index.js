import Tokens from './../tokens';
import _ from 'lodash';
import {
  createSymbol,
  literalSymbol,
  prefixSymbol,
  infixSymbol,
  EOFSymbol
} from './symbols';

class Parser {
  constructor() {
    this.symbols = {};
  }

  registerSymbol(newSymbol) {
    const oldSymbol = this.symbols[newSymbol.type];
    this.symbols[newSymbol.type] = newSymbol.mergeWith(oldSymbol);
    return this;
  }

  parse(tokens = []) {
    this.tokens = [...tokens, { type: Tokens.EOF, value: Tokens.EOF }];
    this.position = 0;

    let parseTree = [];
    while (!this.hasTopToken(Tokens.EOF)) {
      parseTree.push(this.expression());
    }

    return parseTree;
  }

  expression(rbp = 0) {
    let nextSymbol = this.peek();
    this.advance();

    let left = nextSymbol.nud(nextSymbol, this);
    while (rbp < this.peek().lbp) {
      nextSymbol = this.peek();
      this.advance();
      left = nextSymbol.led(left, this);
    }
    return left;
  }

  peek() {
    return this.symbolFor(this.tokens[this.position]);
  }

  hasTopToken(type) {
    const symbol = this.peek();
    return (symbol && symbol.type === type);
  }

  symbolFor(token) {
    if (!token) return token;

    const matchingSymbol = this.symbols[token.type];
    if (!matchingSymbol) {
      throw new Error(`Unexpected token type ${token.type}`)
    }

    const symbol = Object.create(matchingSymbol);
    symbol.type = token.type;
    symbol.value = token.value;
    return symbol;
  }

  advance(expectedToken) {
    if (expectedToken) {
      if (!this.hasTopToken(expectedToken)) {
        throw new Error(`Unable to parse. Expected token '${expectedToken}' instead got '${_.result(this.peek(), 'type')}'`);
      }
    }

    this.position++;
  }
}

const createParser = function () {
  const parser = new Parser();

  const constantSymbols = [
    createSymbol(Tokens.Comma),
    createSymbol(Tokens.Semicolon),
    createSymbol(Tokens.RightParen),
    createSymbol(Tokens.RightBrace),
    createSymbol(Tokens.RightSquare),
    createSymbol(Tokens.Else)
  ];

  const literalSymbols = [
    literalSymbol(Tokens.Identifier),

    literalSymbol(Tokens.True),
    literalSymbol(Tokens.False),

    literalSymbol(Tokens.Colon),

    literalSymbol(Tokens.String),
    literalSymbol(Tokens.Number)
  ];

  const prefixSymbols = [
    prefixSymbol(Tokens.LeftParen)
      .withLbp(19)
      .withRbp(19)
      .withNud(function(token, symbolConsumer) {
        const expression = symbolConsumer.expression();
        symbolConsumer.advance(Tokens.RightParen);

        return expression;
      })
    ,

    prefixSymbol(Tokens.LeftSquare)
      .withNud(function (_token, symbolConsumer) {
        let values = [];

        while (!symbolConsumer.hasTopToken(Tokens.RightSquare)) {
          values.push(symbolConsumer.expression());
          if (!symbolConsumer.hasTopToken(Tokens.Comma)) {
            break;
          }
          symbolConsumer.advance(Tokens.Comma);
        }

        symbolConsumer.advance(Tokens.RightSquare);

        return {
          type: 'Array',
          value: values
        }
      })
    ,

    prefixSymbol(Tokens.Minus).withLbp(15).withRbp(15),
    prefixSymbol(Tokens.Plus).withLbp(15).withRbp(15)
  ];

  const infixSymbols = [
    infixSymbol(Tokens.LeftParen)
      .withLbp(17)
      .withRbp(17)
      .withLed(function (left, symbolConsumer) {
        let args = [];
        while (!symbolConsumer.hasTopToken(Tokens.RightParen)) {
          args.push(symbolConsumer.expression());

          if (!symbolConsumer.hasTopToken(Tokens.Comma)) {
            break;
          }
          symbolConsumer.advance(Tokens.Comma);
        }

        symbolConsumer.advance(Tokens.RightParen);

        return {
          type: 'application',
          left,
          args
        }
      })
    ,

    infixSymbol(Tokens.Multiply).withLbp(14).withRbp(14),
    infixSymbol(Tokens.Divide).withLbp(14).withRbp(14),
    infixSymbol(Tokens.Minus).withLbp(13).withRbp(13),
    infixSymbol(Tokens.Plus).withLbp(13).withRbp(13),

    infixSymbol(Tokens.GreaterThan).withLbp(11).withRbp(11),
    infixSymbol(Tokens.GreaterThanEquals).withLbp(11).withRbp(11),
    infixSymbol(Tokens.LessThan).withLbp(11).withRbp(11),
    infixSymbol(Tokens.LessThanEquals).withLbp(11).withRbp(11),

    infixSymbol(Tokens.Pipe).withLbp(9).withRbp(9),
    infixSymbol(Tokens.And).withLbp(7).withRbp(7),

    infixSymbol(Tokens.Or).withLbp(6).withRbp(6),
    infixSymbol(Tokens.AndAnd).withLbp(5).withRbp(5),

    infixSymbol(Tokens.QuestionMark)
      .withLbp(3)
      .withRbp(3)
      .withLed(function (condition, symbolConsumer) {
        const left = symbolConsumer.expression();
        symbolConsumer.advance(Tokens.Colon);
        const right = symbolConsumer.expression();

        return {
          type: 'Ternary',
          condition,
          left,
          right
        };
      })
    ,
    infixSymbol(Tokens.Equals).withLbp(3).withRbp(3)
  ];

  const otherSymbols = [

  ];

  const symbols = [
    ...constantSymbols,
    ...infixSymbols,
    ...prefixSymbols,
    ...literalSymbols,
    ...otherSymbols,
    EOFSymbol()
  ];

  _.each(symbols, (symbol) => parser.registerSymbol(symbol));

  return parser;
};

export default function (tokens) {
  return createParser().parse(tokens);
};

