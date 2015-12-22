import Tokens from './../tokens';
import _ from 'lodash';
import {
  literalSymbol,
  prefixSymbol,
  infixSymbol,
  constantSymbol,
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
    while (this.peekSymbol().type !== Tokens.EOF) {
      parseTree.push(this.expression());
    }

    return parseTree;
  }

  expression(rbp = 0) {
    let nextSymbol = this.peekSymbol();
    this.advance();

    let left = nextSymbol.nud(nextSymbol, this);
    while (rbp < this.peekSymbol().lbp) {
      nextSymbol = this.peekSymbol();
      this.advance();
      left = nextSymbol.led(left, this);
    }
    return left;
  }

  peekSymbol() {
    return this.symbolFor(this.tokens[this.position]);
  }

  symbolFor(token) {
    const symbol = Object.create(this.symbols[token.type]);
    symbol.type = token.type;
    symbol.value = token.value;
    return symbol;
  }

  advance() {
    this.position++;
  }
}

const createParser = function () {
  const parser = new Parser();

  const constantSymbols = [
    constantSymbol(Tokens.True),
    constantSymbol(Tokens.False)
  ];

  const literalSymbols = [
    literalSymbol(Tokens.String),
    literalSymbol(Tokens.Number),
    literalSymbol(Tokens.LeftParen).withNud((value, symbolConsumer) => {
      symbolConsumer.next();
    }),
    literalSymbol(Tokens.RightParen)
  ];

  const prefixSymbols = [
    prefixSymbol(Tokens.Minus).withLbp(15).withRbp(15),
    prefixSymbol(Tokens.Plus).withLbp(15).withRbp(15)
  ];

  const infixSymbols = [
    infixSymbol(Tokens.Minus).withLbp(13).withRbp(13),
    infixSymbol(Tokens.Plus).withLbp(13).withRbp(13)
  ];

  const symbols = [
    ...infixSymbols,
    ...prefixSymbols,
    ...literalSymbols,
    EOFSymbol()
  ];

  _.each(symbols, (symbol) => parser.registerSymbol(symbol));

  return parser;
};

export default function (tokens) {
  return createParser().parse(tokens);
};

