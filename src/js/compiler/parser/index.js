import Tokens from './../tokens';
import _ from 'lodash';

const notImplemented = () => { throw new Error('Not Implemented') };
const isNotImplemented = (func) => (func === notImplemented);

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

class Symbol {
  constructor(type) {
    this.type = type;
    this.nud = notImplemented;
    this.rbp = 0;
    this.lbp = 0;
    this.led = notImplemented;
  }

  withNud(nud) {
    this.nud = nud;
    return this;
  }

  withLbp(lbp) {
    this.lbp = lbp;
    return this;
  }

  withRbp(rbp) {
    this.rbp = rbp;
    return this;
  }

  withLed(led) {
    this.led = led;
    return this;
  }

  mergeWith(other) {
    if (!other) return Object.create(this);

    const combinedSymbol = Object.create(other);

    if (isNotImplemented(other.nud)) {
      combinedSymbol.nud = this.nud;
    }

    if (isNotImplemented(other.led)) {
      combinedSymbol.led = this.led;
    }

    return combinedSymbol;
  }
}

class LiteralSymbol extends Symbol {
  static create(type) {
    return new this(type).withNud(({ type, value }) => ({ type, value }))
  }
}

class PrefixSymbol extends Symbol {
  static create(type) {
    const symbol = new this(type);
    return symbol.withNud(function (_token, symbolConsumer) {
      return {
        type,
        right: symbolConsumer.expression(symbol.rbp)
      }
    });
  }
}

class InfixSymbol extends Symbol {
  static create(type) {
    const symbol = new this(type);
    return symbol.withLed(function (left, symbolConsumer) {
      return {
        type,
        left,
        right: symbolConsumer.expression(symbol.rbp)
      }
    })
  }
}

class ConstantSymbol extends Symbol {
  static create(type) {
    return new this(type).withNud(({ type, value }) => ({ type, value }))
  }
}

class EOFSymbol extends ConstantSymbol {
  static create() {
    return new this(Tokens.EOF).withNud(({ type, value }) => ({ type, value }))
  }
}

const createParser = function () {
  const parser = new Parser();

  const constantSymbols = [
    ConstantSymbol.create(Tokens.True),
    ConstantSymbol.create(Tokens.False)
  ];

  const literalSymbols = [
    LiteralSymbol.create(Tokens.String),
    LiteralSymbol.create(Tokens.Number),
    LiteralSymbol.create(Tokens.LeftParen).withNud((value, symbolConsumer) => {
      symbolConsumer.next();
    }),
    LiteralSymbol.create(Tokens.RightParen)
  ];

  const prefixSymbols = [
    PrefixSymbol.create(Tokens.Minus).withLbp(15).withRbp(15),
    PrefixSymbol.create(Tokens.Plus).withLbp(15).withRbp(15)
  ];

  const infixSymbols = [
    InfixSymbol.create(Tokens.Minus).withLbp(13).withRbp(13),
    InfixSymbol.create(Tokens.Plus).withLbp(13).withRbp(13)
  ];

  const symbols = [
    ...infixSymbols,
    ...prefixSymbols,
    ...literalSymbols,
    EOFSymbol.create()
  ];

  _.each(symbols, (symbol) => parser.registerSymbol(symbol));

  return parser;
};

export default function (tokens) {
  return createParser().parse(tokens);
};

