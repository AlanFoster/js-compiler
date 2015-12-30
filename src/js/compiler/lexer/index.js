import _ from 'lodash';
import Tokens from './../tokens';
import {
  isWhitespace,
  isLetter,
  isDigit
} from './predicates';

const keywords = {
  'var': Tokens.Var,
  'if': Tokens.If,
  'else': Tokens.Else,
  'true': Tokens.True,
  'false': Tokens.False,
  'function': Tokens.Function
};

const punctuation = {
  ';': Tokens.Semicolon,
  '!': Tokens.Not,
  ',': Tokens.Comma,
  '.': Tokens.Dot,
  '+': Tokens.Plus,
  '-': Tokens.Minus,
  '/': Tokens.Divide,
  '*': Tokens.Multiply,
  ':': Tokens.Colon,
  '?': Tokens.QuestionMark,
  '(': Tokens.LeftParen,
  ')': Tokens.RightParen,
  '{': Tokens.LeftBrace,
  '}': Tokens.RightBrace,
  '[': Tokens.LeftSquare,
  ']': Tokens.RightSquare,
  '=': Tokens.Equals,
  '!=': Tokens.NotEquals,
  '==': Tokens.EqualsEquals,
  '|': Tokens.Pipe,
  '||': Tokens.Or,
  '&': Tokens.And,
  '&&': Tokens.AndAnd,
  '>': Tokens.GreaterThan,
  '>=': Tokens.GreaterThanEquals,
  '<': Tokens.LessThan,
  '<=': Tokens.LessThanEquals
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

    const from = this.position;
    const token = (
      this.scanIdentifier() ||
      this.scanPunctuation() ||
      this.scanNumber() ||
      this.scanString() ||
      this.error()
    );

    return _.extend({}, token, { from, to: this.position });
  }

  scanIdentifier() {
    if (!isLetter(this.peek())) return;

    const value = this.takeWhile(next => isLetter(next) || isDigit(next));
    const type = keywords[value] || Tokens.Identifier;

    return { type, value };
  }

  scanPunctuation() {
    if (!punctuation[this.peek()]) return;

    const next = this.pop();
    const isTwoLengthPunctuation = punctuation[next  + this.peek()];
    const value = isTwoLengthPunctuation ? (next + this.pop()) : next;

    return { type: punctuation[value], value };
  }

  scanNumber() {
    if (!isDigit(this.peek())) return;

    let value = this.takeWhile(isDigit);

    if (this.peek() === '.') {
      value += this.pop();

      if (!isDigit(this.peek())) {
        return this.error(value);
      }

      value += this.takeWhile(isDigit);
    }

    return { type: Tokens.Number, value };
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

    this.pop();
    let value = this.takeWhile(next => next !== opening);
    if (this.peek() !== opening) {
      return this.error(opening + value);
    }

    this.pop();
    return { type: Tokens.String, value }
  }

  error(currentBuffer = '') {
    return {
      type: Tokens.ERROR,
      value: currentBuffer + this.takeWhile(_ => true),
    }
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
