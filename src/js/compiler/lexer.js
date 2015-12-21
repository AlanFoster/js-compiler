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
  'ERROR'
]);

const keywords = {
  'var': Tokens.Var
};

const punctuation = {
  ';': Tokens.Semicolon,
  '=': Tokens.Equals
};

const isWhitespace = function (char) {
  return (
    char === ' ' ||
    char === '\t' ||
    char === '\r' ||
    char === '\n'
  );
};

const isLetter = function (char) {
  return (
    char >= 'a' && char <= 'z' ||
    char >= 'A' && char <= 'Z'
  );
};

const isDigit = function (char) {
  return char >= '0' && char <= '9';
};

class Lexer {
  constructor(string = '') {
    this.string = string;
    this.position = 0;
  }

  tokenize() {
    let tokens = [];

    while (this.position < this.string.length) {
      const token = this.consumeNextToken();
      if (token) {
        tokens.push(token);
      }
    }

    return tokens;
  }

  consumeNextToken() {
    this.skipWhitespace();
    if (!this.peek()) return;

    return (
      this.scanIdentifier() ||
      this.scanPunctuation() ||
      this.error()
    );
  }

  scanIdentifier() {
    if (!isLetter(this.peek())) return;

    const buffer = this.takeWhile(next => isLetter(next) || isDigit(next));
    const type = keywords[buffer] || Tokens.Identifier;

    return {type, value: buffer};
  }

  scanPunctuation() {
    const matchingPunctuation = punctuation[this.peek()];
    if (!matchingPunctuation) return;

    const value = this.pop();
    return {type: matchingPunctuation, value}
  }

  error() {
    return {type: Tokens.ERROR, value: this.takeWhile(_ => true)}
  }

  skipWhitespace() {
    this.takeWhile(isWhitespace);
  }

  peek() {
    return this.string[this.position];
  }

  pop() {
    const next = this.peek();
    this.position++;

    return next;
  }

  takeWhile(predicate) {
    let buffer = '';
    while (this.peek() && predicate(this.peek())) {
      buffer += this.pop();
    }
    return buffer;
  }
}

export default function (string) {
  return new Lexer(string).tokenize();
};
