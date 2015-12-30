describe('Lexer', function () {
  beforeEach(function () {
    this.lexer = require('compiler/lexer').default;
  });

  describe('when given empty inputs', function () {
    it('lexes undefined input', function () {
      expect(this.lexer(undefined)).toEqual([]);
    });

    it('lexes empty strings', function () {
      expect(this.lexer('')).toEqual([]);
    });

    it('lexes whitespace filled strings', function () {
      expect(this.lexer('  \t\r\n\t\t\    ')).toEqual([]);
    });
  });

  describe('strings', function () {
    describe('single quotes', function () {
      it('handles correctly closed strings', function () {
        expect(this.lexer("'hello world'")).toEqual([
          { type: 'String', value: 'hello world', from: 0, to: 13 }
        ]);
      });

      it('handles incorrectly closed strings', function () {
        expect(this.lexer("'hello world")).toEqual([
          { type: 'ERROR', value: "'hello world", from: 0, to: 12}
        ]);
      });
    });

    describe('double quotes', function () {
      it('handles correctly closed strings', function () {
        expect(this.lexer('"hello world"')).toEqual([
          { type: 'String', value: 'hello world', from: 0, to: 13 }
        ]);
      });

      it('handles incorrectly closed strings', function () {
        expect(this.lexer('"hello world')).toEqual([
          { type: 'ERROR', value: '"hello world', from: 0, to: 12 }
        ]);
      });
    });
  });

  describe('simple lexing', function () {
    const it_lexes = function (string) {
      return {
        toBe(type) {
          it (`lexes ${string} correctly`, function () {
            expect(this.lexer(string)).toEqual([
              { type, value: string, from: 0, to: string.length }
            ])
          });
        }
      }
    };

    describe('punctuation', function () {
      it_lexes(';').toBe('Semicolon');
      it_lexes('!').toBe('Not');
      it_lexes('.').toBe('Dot');
      it_lexes(',').toBe('Comma');
      it_lexes('+').toBe('Plus');
      it_lexes('-').toBe('Minus');
      it_lexes('/').toBe('Divide');
      it_lexes('*').toBe('Multiply');
      it_lexes(':').toBe('Colon');
      it_lexes('?').toBe('QuestionMark');
      it_lexes('(').toBe('LeftParen');
      it_lexes(')').toBe('RightParen');
      it_lexes('{').toBe('LeftBrace');
      it_lexes('}').toBe('RightBrace');
      it_lexes('[').toBe('LeftSquare');
      it_lexes(']').toBe('RightSquare');
      it_lexes('=').toBe('Equals');
      it_lexes('!=').toBe('NotEquals');
      it_lexes('==').toBe('EqualsEquals');
      it_lexes('|').toBe('Pipe');
      it_lexes('||').toBe('Or');
      it_lexes('&').toBe('And');
      it_lexes('&&').toBe('AndAnd');
    });

    describe('reserved words', function () {
      it_lexes('var').toBe('Var');
      it_lexes('if').toBe('If');
      it_lexes('else').toBe('Else');
      it_lexes('true').toBe('True');
      it_lexes('false').toBe('False');
      it_lexes('function').toBe('Function');
    });
  });

  describe('numbers', function () {
    it('handles digits', function () {
      expect(this.lexer("1337")).toEqual([
        { type: 'Number', value: '1337', from: 0, to: 4 }
      ]);
    });

    it('handles digits with precision', function () {
      expect(this.lexer("13.37")).toEqual([
        { type: 'Number', value: '13.37', from: 0, to: 5 }
      ]);
    });

    it('does not consider unary operators', function () {
      expect(this.lexer("-13.37")).toEqual([
        { type: 'Minus', value: '-', from: 0, to: 1 },
        { type: 'Number', value: '13.37', from: 1, to: 6 }
      ]);
    });

    it('returns an error token when it could not match successfully', function () {
      expect(this.lexer("13.")).toEqual([
        { type: 'ERROR', value: '13.', from: 0, to: 3 }
      ]);
    });
  });

  describe('assignment', function () {
    it ('handles string assignment', function () {
      expect(this.lexer("var x = 'hello world';")).toEqual([
        { type: 'Var', value: 'var', from: 0, to: 3 },
        { type: 'Identifier', value: 'x', from: 4, to: 5 },
        { type: 'Equals', value: '=', from: 6, to: 7 },
        { type: 'String', value: "hello world", from: 8, to: 21 },
        { type: 'Semicolon', value: ';', from: 21, to: 22 }
      ]);
    });

    it('handles number assignment', function () {
      expect(this.lexer("var x = 1337;")).toEqual([
        { type: 'Var', value: 'var', from: 0, to: 3 },
        { type: 'Identifier', value: 'x', from: 4, to: 5 },
        { type: 'Equals', value: '=', from: 6, to: 7 },
        { type: 'Number', value: '1337', from: 8, to: 12 },
        { type: 'Semicolon', value: ';', from: 12, to: 13 }
      ]);
    });

    it('handles multiple assignments', function () {
      const src = `var x = 1;\nvar y = 2;\nvar z = x + y;`;

      expect(this.lexer(src)).toEqual([
        { type: 'Var', value: 'var', from: 0, to: 3 },
        { type: 'Identifier', value: 'x', from: 4, to: 5 },
        { type: 'Equals', value: '=', from: 6, to: 7 },
        { type: 'Number', value: '1', from: 8, to: 9 },
        { type: 'Semicolon', value: ';', from: 9, to: 10 },

        { type: 'Var', value: 'var', from: 11, to: 14 },
        { type: 'Identifier', value: 'y', from: 15, to: 16 },
        { type: 'Equals', value: '=', from: 17, to: 18 },
        { type: 'Number', value: '2', from: 19, to: 20 },
        { type: 'Semicolon', value: ';', from: 20, to: 21 },

        { type: 'Var', value: 'var', from: 22, to: 25 },
        { type: 'Identifier', value: 'z', from: 26, to: 27 },
        { type: 'Equals', value: '=', from: 28, to: 29 },
        { type: 'Identifier', value: 'x', from: 30, to: 31 },
        { type: 'Plus', value: '+', from: 32, to: 33 },
        { type: 'Identifier', value: 'y', from: 34, to: 35 },
        { type: 'Semicolon', value: ';', from: 35, to: 36 }
      ]);
    });
  });

  describe('error', function () {
    it ('returns an error token when unable to parse the user input', function (){
      expect(this.lexer('var £ = 10;')).toEqual([
        { type: 'Var', value: 'var', from: 0, to: 3 },
        { type: 'ERROR', value: '£ = 10;', from: 4, to: 11 }
      ]);
    });
  });
});
