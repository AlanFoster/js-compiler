describe('Parser', function () {
  beforeEach(function () {
    this.lexer = require('compiler/lexer').default;
    this.parser = require('compiler/parser').default;
  });

  describe('when given empty inputs', function () {
    it('parses undefined input', function () {
      expect(this.parser(undefined)).toEqual([]);
    });

    it('parses an empty stream of tokens', function () {
      expect(this.lexer([])).toEqual([]);
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

  describe('infix operators', function () {
    describe('+', function () {
      it('parses digits by themselves', function () {
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
        it('parses digits by themselves', function () {
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
    });
  });
});
