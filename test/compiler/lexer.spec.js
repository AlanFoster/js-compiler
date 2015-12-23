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
          { type: 'String', value: "'hello world'" }
        ]);
      });

      it('handles incorrectly closed strings', function () {
        expect(this.lexer("'hello world")).toEqual([
          { type: 'ERROR', value: "'hello world" }
        ]);
      });
    });

    describe('double quotes', function () {
      it('handles correctly closed strings', function () {
        expect(this.lexer('"hello world"')).toEqual([
          { type: 'String', value: '"hello world"' }
        ]);
      });

      it('handles incorrectly closed strings', function () {
        expect(this.lexer('"hello world')).toEqual([
          { type: 'ERROR', value: '"hello world' }
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
              { type, value: string }
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
    });
  });

  describe('numbers', function () {
    it('handles digits', function () {
      expect(this.lexer("1337")).toEqual([
        { type: 'Number', value: '1337' }
      ]);
    });

    it('handles digits with precision', function () {
      expect(this.lexer("13.37")).toEqual([
        { type: 'Number', value: '13.37' }
      ]);
    });

    it('does not consider unary operators', function () {
      expect(this.lexer("-13.37")).toEqual([
        { type: 'Minus', value: '-' },
        { type: 'Number', value: '13.37' }
      ]);
    });

    it('returns an error token when it could not match successfully', function () {
      expect(this.lexer("13.")).toEqual([
        { type: 'ERROR', value: '13.' }
      ]);
    });
  });

  describe('assignment', function () {
    it ('handles string assignment', function () {
      expect(this.lexer("var x = 'hello world';")).toEqual([
        { type: 'Var', value: 'var' },
        { type: 'Identifier', value: 'x' },
        { type: 'Equals', value: '=' },
        { type: 'String', value: "'hello world'" },
        { type: 'Semicolon', value: ';' }
      ]);
    });

    it('handles number assignment', function () {
      expect(this.lexer("var x = 1337;")).toEqual([
        { type: 'Var', value: 'var' },
        { type: 'Identifier', value: 'x' },
        { type: 'Equals', value: '=' },
        { type: 'Number', value: '1337' },
        { type: 'Semicolon', value: ';' }
      ]);
    });

    it('handles multiple assignments', function () {
      const src = `
        var x = 1;
        var y = 2;
        var z = x + y;
      `;

      expect(this.lexer(src)).toEqual([
        { type: 'Var', value: 'var' },
        { type: 'Identifier', value: 'x' },
        { type: 'Equals', value: '=' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: ';' },

        { type: 'Var', value: 'var' },
        { type: 'Identifier', value: 'y' },
        { type: 'Equals', value: '=' },
        { type: 'Number', value: '2' },
        { type: 'Semicolon', value: ';' },

        { type: 'Var', value: 'var' },
        { type: 'Identifier', value: 'z' },
        { type: 'Equals', value: '=' },
        { type: 'Identifier', value: 'x' },
        { type: 'Plus', value: '+' },
        { type: 'Identifier', value: 'y' },
        { type: 'Semicolon', value: ';' }
      ]);
    });
  });

  describe('error', function () {
    it ('returns an error token when unable to parse the user input', function (){
      expect(this.lexer('var £ = 10;')).toEqual([
        { type: 'Var', value: 'var' },
        { type: 'ERROR', value: '£ = 10;' }
      ]);
    });
  });
});
