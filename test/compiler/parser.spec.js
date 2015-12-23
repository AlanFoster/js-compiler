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
        { type: 'Number', value: '123' }
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
          { type: 'True', value: 'True' }
        ];

        expect(this.parser(tokens)).toEqual([
          { type: 'True', value: 'True' }
        ]);
      });
    });

    describe('false', function (){
      it('parses False', function () {
        const tokens = [
          { type: 'False', value: 'False' }
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
          { type: 'Number', value: '123' }
        ];

        expect(this.parser(tokens)).toEqual([
          { type: 'Number', value: '123' }
        ]);
      });

      it('parses a minus prefix', function () {
        const tokens = [
          { type: 'Minus', value: '-' },
          { type: 'Number', value: '123' }
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
          { type: 'Number', value: '123' }
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
          { type: 'Number', value: '321' }
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
        { type: 'RightParen', value: 'RightParen' }
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
        { type: 'RightParen', value: 'RightParen' }
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
        { type: 'RightParen', value: 'RightParen' }
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

  describe('infix operators', function () {
    describe('+', function () {
      it('parses binary addition', function () {
        const tokens = [
          { type: 'Number', value: '1' },
          { type: 'Plus', value: 'Plus' },
          { type: 'Number', value: '2' }
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
            { type: 'Number', value: '2' }
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
            { type: 'Number', value: '2' }
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
            { type: 'Identifier', value: 'a' }
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

      describe('=', function () {
        it('allows assignment', function () {
          const tokens = [
            { type: 'Identifier', value: 'x' },
            { type: 'Equals', value: 'Equals' },
            { type: 'Number', value: '10' }
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
    });
  });
});
