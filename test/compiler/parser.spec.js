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
          type: 'Application',
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
          type: 'Application',
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
          type: 'Application',
          left: { type: 'Identifier', value: 'functionName' },
          args: [
            { type: 'Number', value: '1' },
            { type: 'Number', value: '2' }
          ]
        }
      ]);
    });
  });

  describe('variable creation', function () {
    it ('allows a single expression to be assigned', function () {
      const tokens = [
        { type: 'Var', value: 'Var' },
        { type: 'Identifier', value: 'foo' },
        { type: 'Equals', value: 'Equals' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Initialization',
          left: { type: 'Identifier', value: 'foo' },
          right: { type: 'Number', value: '1' }
        }
      ]);
    });

    it ('requires an initial value', function () {
      const tokens = [
        { type: 'Var', value: 'Var' },
        { type: 'Identifier', value: 'foo' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(() => this.parser(tokens)).toThrowError("Unable to parse. Expected token 'Equals' instead got 'Semicolon'");
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

      expect(() => this.parser(tokens)).toThrowError("Unable to parse. Expected token 'RightSquare' instead got 'EOF'");
    });

    it ('returns an error when there is no values', function () {
      const tokens = [
        { type: 'LeftSquare', value: 'LeftSquare' },
        { type: 'Comma', value: 'Comma' },
        { type: 'RightSquare', value: 'RightSquare' }
      ];

      expect(() => this.parser(tokens)).toThrowError('Not Implemented');
    });
  });

  describe('infix operators', function () {
    describe('binary operators', function () {
      const it_parses_infix_binary_operator = function (operator) {
        it(`parses binary operator ${operator} correctly`, function () {
          const tokens = [
            { type: 'Number', value: '1' },
            { type: operator, value: operator },
            { type: 'Number', value: '2' },
            { type: 'Semicolon', value: 'Semicolon' }
          ];

          expect(this.parser(tokens)).toEqual([
            {
              type: operator,
              left: { type: 'Number', value: '1' },
              right: { type: 'Number', value: '2' }
            }
          ]);
        });
      };

      it_parses_infix_binary_operator('Plus');
      it_parses_infix_binary_operator('Minus');
      it_parses_infix_binary_operator('Multiply');
      it_parses_infix_binary_operator('Divide');
      it_parses_infix_binary_operator('NotEquals');
      it_parses_infix_binary_operator('EqualsEquals');
      it_parses_infix_binary_operator('GreaterThan');
      it_parses_infix_binary_operator('GreaterThanEquals');
      it_parses_infix_binary_operator('LessThan');
      it_parses_infix_binary_operator('LessThanEquals');
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
            type: 'If',
            condition: { type: 'True', value: 'True' },
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ]);
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

  describe ('while', function () {
    it('parses a while loop with no body', function () {
      const tokens = [
        { type: 'While', value: 'While' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'True', value: 'True' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'RightBrace', value: 'RightBrace' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'While',
          condition: { type: 'True', value: 'True' },
          value: {
            type: 'Block',
            value: []
          }
        }
      ]);
    });

    it('parses a while loop with a body', function () {
      const tokens = [
        { type: 'While', value: 'While' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'True', value: 'True' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'While',
          condition: { type: 'True', value: 'True' },
          value: {
            type: 'Block',
            value: [
              { type: 'Number', value: '1' }
            ]
          }
        }
      ]);
    });

    it('parses a while loop with a body with statements before and after', function () {
      const tokens = [
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'While', value: 'While' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'True', value: 'True' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
      ];

      expect(this.parser(tokens)).toEqual([
        { type: 'Number', value: '1' },
        {
          type: 'While',
          condition: { type: 'True', value: 'True' },
          value: {
            type: 'Block',
            value: [
              { type: 'Number', value: '1' }
            ]
          }
        },
        { type: 'Number', value: '1' }
      ]);
    });
  });

  describe('functions', function() {
    it('parses an anonymous function with no arguments', function () {
      const tokens = [
        { type: 'Function', value: 'Function' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Function',
          identifier: null,
          args: [],
          value: [
            { type: 'Number', value: '1' }
          ]
        }
      ]);
    });

    it('parses a named function with no arguments', function () {
      const tokens = [
        { type: 'Function', value: 'Function' },
        { type: 'Identifier', value: 'One' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Function',
          identifier: 'One',
          args: [],
          value: [
            { type: 'Number', value: '1' }
          ]
        }
      ]);
    });

    it('parses an anonyous function with arguments', function () {
      const tokens = [
        { type: 'Function', value: 'Function' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'Identifier', value: 'x' },
        { type: 'Comma', value: 'Comma' },
        { type: 'Identifier', value: 'y' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Function',
          identifier: null,
          args: [
            'x',
            'y'
          ],
          value: [
            { type: 'Number', value: '1' }
          ]
        }
      ]);
    });

    it('parses a named function with arguments', function () {
      const tokens = [
        { type: 'Function', value: 'Function' },
        { type: 'Identifier', value: 'foo' },
        { type: 'LeftParen', value: 'LeftParen' },
        { type: 'Identifier', value: 'x' },
        { type: 'Comma', value: 'Comma' },
        { type: 'Identifier', value: 'y' },
        { type: 'RightParen', value: 'RightParen' },
        { type: 'LeftBrace', value: 'LeftBrace' },
        { type: 'Number', value: '1' },
        { type: 'Semicolon', value: 'Semicolon' },
        { type: 'RightBrace', value: 'RightBrace' },
        { type: 'Semicolon', value: 'Semicolon' }
      ];

      expect(this.parser(tokens)).toEqual([
        {
          type: 'Function',
          identifier: 'foo',
          args: [
            'x',
            'y'
          ],
          value: [
            { type: 'Number', value: '1' }
          ]
        }
      ]);
    });
  });
});
