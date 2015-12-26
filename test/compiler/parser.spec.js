describe('Parser', function () {
  beforeEach(function () {
    this.parser = require('compiler/parser').default;
  });

  describe('when given empty inputs', function () {
    it('parses undefined input', function () {
      expect(this.parser(undefined)).toEqual([]);
    });

    it('parses an empty stream of tokens', function () {
      expect(this.parser([])).toEqual([]);
    });
  });

  describe('number parsing', function () {
    it('parses digits by themselves', function () {
      const tokens = [
        { type: 'Number', value: '123' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        { type: 'Number', value: '123' }
      ]);
    });
  });

  describe('literals', function () {
    describe('true', function (){
      it('parses True', function () {
        const tokens = [
          { type: 'True', value: 'True' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          { type: 'True', value: 'True' }
        ]);
      });
    });

    describe('false', function (){
      it('parses False', function () {
        const tokens = [
          { type: 'False', value: 'False' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          { type: 'False', value: 'False' }
        ]);
      });
    });
  });

  describe('prefix operators', function () {
    describe('-', function () {
      it('parses digits by themselves', function () {
        const tokens = [
          { type: 'Number', value: '123' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          { type: 'Number', value: '123' }
        ]);
      });

      it('parses a minus prefix', function () {
        const tokens = [
          { type: 'Minus', value: '-' },
          { type: 'Number', value: '123' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          {
            type: 'Minus',
            right: {
              type: 'Number',
              value: '123'
            }
          }
        ]);
      });

      it('parses multiple minus prefix', function () {
        const tokens = [
          { type: 'Minus', value: '-' },
          { type: 'Minus', value: '-' },
          { type: 'Number', value: '123' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          {
            type: 'Minus',
            right: {
              type: 'Minus',
              right: {
                type: 'Number',
                value: '123'
              }
            }
          }
        ]);
      });
    });

    describe('+', function () {
      it('parses a plus prefix', function () {
        const tokens = [
          { type: 'Plus', value: '+' },
          { type: 'Number', value: '321' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          {
            type: 'Plus',
            right: {
              type: 'Number',
              value: '321'
            }
          }
        ]);
      });
    });
  });

  describe('function calls', function () {
    it('parses empty arguments', function () {
      const tokens = [
        { type: 'Identifier', value: 'functionName' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'application',
          left: { type: 'Identifier', value: 'functionName' },
          args: []
        }
      ]);
    });

    it('parses when there is one number argument', function () {
      const tokens = [
        { type: 'Identifier', value: 'functionName' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'Number', value: '1' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'application',
          left: { type: 'Identifier', value: 'functionName' },
          args: [
            { type: 'Number', value: '1' }
          ]
        }
      ]);
    });

    it('parses when there is multiple arguments', function () {
      const tokens = [
        { type: 'Identifier', value: 'functionName' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'Number', value: '1' },
        { type: 'Comma', value: ',' },
        { type: 'Number', value: '2' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'application',
          left: { type: 'Identifier', value: 'functionName' },
          args: [
            { type: 'Number', value: '1' },
            { type: 'Number', value: '2' }
          ]
        }
      ]);
    });
  });

  describe('array creation', function () {
    it ('allows the creation of an empty array', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'RightSquare', value: 'RightSquare' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Array',
          value: []
        }
      ]);
    });

    it ('allows the creation of a one valued array', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'Number', value: '123' },
        { type: 'RightSquare', value: 'RightSquare' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Array',
          value: [
            { type: 'Number', value: '123' }
          ]
        }
      ]);
    });

    it ('allows the creation of a multiple valued array', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'Number', value: '123' },
        { type: 'Comma', value: 'Comma' },
        { type: 'Identifier', value: 'b' },
        { type: 'RightSquare', value: 'RightSquare' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Array',
          value: [
            { type: 'Number', value: '123' },
            { type: 'Identifier', value: 'b' }
          ]
        }
      ]);
    });

    it ('returns an error when there is no ] suffix', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'Number', value: '123' }
      ];

      expect(() => this.parser(tokens)).toThrow(new Error("Unable to parse. Expected token 'RightSquare' instead got 'EOF'"));
    });

    it ('returns an error when there is no values', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'Comma', value: 'Comma' },
        { type: 'RightSquare', value: 'RightSquare' }
      ];

      expect(() => this.parser(tokens)).toThrow(new Error('Not Implemented'));
    });
  });

  describe('infix operators', function () {
    describe('+', function () {
      it('parses binary addition', function () {
        const tokens = [
          { type: 'Number', value: '1' },
          { type: 'Plus', value: 'Plus' },
          { type: 'Number', value: '2' },
          { type: 'Semicolon', value: 'Semicolon' }
        ];

        expect(this.parser(tokens)).toEqual([
          {
            type: 'Plus',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '2' }
          }
        ]);
      });

      describe('-', function () {
        it('parses binary subtraction', function () {
          const tokens = [
            { type: 'Number', value: '1' },
            { type: 'Minus', value: 'Minus' },
            { type: 'Number', value: '2' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'Minus',
              left: { type: 'Number', value: '1' },
              right: { type: 'Number', value: '2' }
            }
          ]);
        });
      });

      describe('*', function () {
        it('parses binary multiplication', function () {
          const tokens = [
            { type: 'Number', value: '1' },
            { type: 'Multiply', value: 'Multiply' },
            { type: 'Number', value: '2' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'Multiply',
              left: { type: 'Number', value: '1' },
              right: { type: 'Number', value: '2' }
            }
          ]);
        });
      });

      describe('/', function () {
        it('parses binary division', function () {
          const tokens = [
            { type: 'Number', value: '1' },
            { type: 'Divide', value: 'Divide' },
            { type: 'Identifier', value: 'a' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'Divide',
              left: { type: 'Number', value: '1' },
              right: { type: 'Identifier', value: 'a' }
            }
          ]);
        });
      });

      describe('>', function () {
        it('parses binary division', function () {
          const tokens = [
            { type: 'Number', value: '0' },
            { type: 'GreaterThan', value: 'GreaterThan' },
            { type: 'Number', value: '10' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'GreaterThan',
              left: { type: 'Number', value: '0' },
              right: { type: 'Number', value: '10' }
            }
          ]);
        });
      });

      describe('=', function () {
        it('allows assignment', function () {
          const tokens = [
            { type: 'Identifier', value: 'x' },
            { type: 'Equals', value: 'Equals' },
            { type: 'Number', value: '10' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'Equals',
              left: { type: 'Identifier', value: 'x' },
              right: { type: 'Number', value: '10' }
            }
          ]);
        });

        describe('precedence for 100 + 100 / 2', function () {
          it('allows assignment', function () {
            const tokens = [
              { type: 'Number', value: '100' },
              { type: 'Plus', value: 'Plus' },
              { type: 'Number', value: '100' },
              { type: 'Divide', value: 'Divide' },
              { type: 'Number', value: '2' },
              { type: 'Semicolon', value: 'Semicolon' }
            ];

            expect(this.parser(tokens)).toEqual([
              {
                "type": "Plus",
                "left": {
                  "type": "Number",
                  "value": "100"
                },
                "right": {
                  "type": "Divide",
                  "left": {
                    "type": "Number",
                    "value": "100"
                  },
                  "right": {
                    "type": "Number",
                    "value": "2"
                  }
                }
              }
            ]);
          });
        });
      });

      describe('?', function () {
        it('parses ternary successfully', function () {
          const tokens = [
            { type: 'True', value: 'True' },
            { type: 'QuestionMark', value: 'QuestionMark' },
            { type: 'Number', value: '1' },
            { type: 'Colon', value: 'Colon' },
            { type: 'Number', value: '0' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: 'Ternary',
              condition: { type: 'True', value: 'True' },
              left: { type: 'Number', value: '1' },
              right: { type: 'Number', value: '0' }
            }
          ]);
        });
      });
    });
  });

  describe('blocks', function () {
    it('parses a block', function () {
      const tokens = [
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '0' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Block',
          value: [
            { type: 'Number', value: '0' }
          ]
        }
      ]);
    });
  });
});
