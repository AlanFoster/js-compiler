import _ from 'lodash';
import Tokens from './tokens';
import {
  isWhitespace,
  isLetter,
  isDigit
} from './predicates';

const keywords = {
  'var': Tokens.Var
};

const punctuation = {
  ';': Tokens.Semicolon,
  '=': Tokens.Equals
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
      this.scanDigit() ||
      this.scanString() ||
      this.error()
    );
  }

  scanIdentifier() {
    if (!isLetter(this.peek())) return;

    const value = this.takeWhile(next => isLetter(next) || isDigit(next));
    const type = keywords[value] || Tokens.Identifier;

    return { type, value };
  }

  scanPunctuation() {
    const matchingPunctuation = punctuation[this.peek()];
    if (!matchingPunctuation) return;

    const value = this.pop();
    return { type: matchingPunctuation, value };
  }

  scanDigit() {
    if (!isDigit(this.peek())) return;
    return { type: Tokens.Number, value: this.takeWhile(isDigit) };
  }

  scanString() {
    return (
      this.scanStringWithOpening("'") ||
      this.scanStringWithOpening('"')
    );
  }

  skipWhitespace() {
    this.takeWhile(isWhitespace);
  }

  scanStringWithOpening(opening) {
    if (this.peek() !== opening) return;

    let value = this.pop() + this.takeWhile(next => next !== opening);
    if (this.peek() !== opening) {
      return this.error(value);
    }

    value += this.pop();

    return { type: Tokens.String, value }
  }

  error(currentBuffer = '') {
    return { type: Tokens.ERROR, value: currentBuffer + this.takeWhile(_ => true) }
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
