import Tokens from './../tokens';
import _ from 'lodash';
import {
  notImplemented,
  isImplemented,
  isNotImplemented
} from './not-implemented';

import {
  createSymbol,
  literalSymbol,
  prefixSymbol,
  infixSymbol,
  statementSymbol,
  EOFSymbol
} from './symbols';

import { ParseError, UnexpectedTokenError } from '../errors';

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

    const statements = this.statements();
    this.advance(Tokens.EOF);
    return statements;
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

  statement() {
    const nextSymbol = this.peek();
    if (isImplemented(nextSymbol.std)) {
      this.advance();
      return nextSymbol.std(nextSymbol, this);
    }

    const expression = this.expression();
    this.advance(Tokens.Semicolon);
    return expression;
  }

  statements() {
    var statements = [];
    const withinBlock = () => {
      return !(
        this.hasTopToken(Tokens.RightBrace) ||
        this.hasTopToken(Tokens.EOF)
      )
    };

    while (withinBlock()) {
      statements.push(this.statement());
    }

    return statements;
  }

  block() {
    const blockSymbol = this.peek();
    this.advance(Tokens.LeftBrace);
    return blockSymbol.std(blockSymbol, this);
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
      throw new ParseError({
        message: `Unexpected token type ${token.type}`,
        token: token
      });
    }

    const symbol = Object.create(matchingSymbol);
    return _.extend(symbol, token);
  }

  advance(expectedToken) {
    if (expectedToken) {
      if (!this.hasTopToken(expectedToken)) {
        throw new UnexpectedTokenError({
          expected: expectedToken,
          actual: this.peek()
        });
      }
    }

    this.position++;
  }
}

const preserveMetaDataFor = (token) => _.pick(token, 'from', 'to');

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
      .withNud(function(leftParen, symbolConsumer) {
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
    prefixSymbol(Tokens.Plus).withLbp(15).withRbp(15),

    prefixSymbol(Tokens.Function)
      .withNud(function (token, symbolConsumer) {
        let identifier = null;
        if (symbolConsumer.hasTopToken(Tokens.Identifier)) {
          identifier = symbolConsumer.peek().value;
          symbolConsumer.advance();
        }

        symbolConsumer.advance(Tokens.LeftParen);

        const args = [];
        while (!symbolConsumer.hasTopToken(Tokens.RightParen)) {
          if (!symbolConsumer.hasTopToken(Tokens.Identifier)) {
            throw new UnexpectedTokenError({
              expected: Tokens.Identifier,
              actual: symbolConsumer.peek()
            });
          }

          args.push(symbolConsumer.peek().value);
          symbolConsumer.advance(Tokens.Identifier);

          if (!symbolConsumer.hasTopToken(Tokens.Comma)) {
            break;
          }
          symbolConsumer.advance(Tokens.Comma);
        }

        symbolConsumer.advance(Tokens.RightParen);
        symbolConsumer.advance(Tokens.LeftBrace);
        const value = symbolConsumer.statements();
        symbolConsumer.advance(Tokens.RightBrace);

        return {
          type: 'Function',
          identifier,
          args,
          value
        }
      })
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
          type: 'Application',
          left,
          args
        }
      })
    ,

    infixSymbol(Tokens.Multiply).withLbp(14).withRbp(14),
    infixSymbol(Tokens.Divide).withLbp(14).withRbp(14),
    infixSymbol(Tokens.Minus).withLbp(13).withRbp(13),
    infixSymbol(Tokens.Plus).withLbp(13).withRbp(13),

    infixSymbol(Tokens.NotEquals).withLbp(11).withRbp(11),
    infixSymbol(Tokens.EqualsEquals).withLbp(11).withRbp(11),
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
          type: 'If',
          condition,
          left,
          right
        };
      })
    ,
    infixSymbol(Tokens.Equals).withLbp(3).withRbp(3)
  ];

  const otherSymbols = [
    statementSymbol(Tokens.LeftBrace).withStd(function (currentToken, symbolConsumer) {
      const value = symbolConsumer.statements();
      symbolConsumer.advance(Tokens.RightBrace);

      return {
        type: 'Block',
        value
      };
    }),

    statementSymbol(Tokens.Var).withStd(function (currentToken, symbolConsumer) {
      const left = _.extend({}, symbolConsumer.peek());
      symbolConsumer.advance(Tokens.Identifier);
      symbolConsumer.advance(Tokens.Equals);
      const right = symbolConsumer.expression();
      symbolConsumer.advance(Tokens.Semicolon);

      return {
        type: 'Initialization',
        left,
        right
      };
    }),

    statementSymbol(Tokens.While).withStd(function (currentToken, symbolConsumer) {
      symbolConsumer.advance(Tokens.LeftParen);
      const condition = symbolConsumer.expression();
      symbolConsumer.advance(Tokens.RightParen);
      const block = symbolConsumer.block();

      return _.extend({
        type: 'While',
        condition,
        value: block
      }, preserveMetaDataFor(currentToken));
    })
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

