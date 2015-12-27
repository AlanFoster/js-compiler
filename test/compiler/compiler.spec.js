describe('Compiler', function () {
  beforeEach(function () {
    this.compiler = require('compiler').default.compile;
  });

  describe('when given empty inputs', function () {
    it('handles undefined input', function () {
      expect(this.compiler(undefined)).toEqual(undefined);
    });

    it('handles empty strings', function () {
      expect(this.compiler('')).toEqual(undefined);
    });

    it('handles whitespace filled strings', function () {
      expect(this.compiler('  \t\r\n\t\t\    ')).toEqual(undefined);
    });
  });

  describe('basic programs', function () {
    it ('handles assignments and access', function () {
      const program = `
        x = 11;
        y = (1 + 1);

        x * y * 2 - 2;
      `;

      expect(this.compiler(program)).toEqual(42);
    });

    it ('ternary', function () {
      const program = `
        age = 18;

        (age >= 18) ? 'Valid' : 'Invalid';
      `;

      expect(this.compiler(program)).toEqual('Valid');
    });
  });

  describe('function calling', function () {
    it ('handles no argument providing', function () {
      const program = `
        function one () { 1; };
        function two () { one() + 1; };

        one() + two();
      `;

      expect(this.compiler(program)).toEqual(3);
    });


    it ('handles basic function calling', function () {
      const program = `
        function identity(x) { x; };

        identity("hello") + ' ' + identity('world');
      `;

      expect(this.compiler(program)).toEqual('hello world');
    });

    it ('handles nested function calls', function () {
      const program = `
        function add (x, y) {
          x + y;
        };

        function subtract (x, y) {
          x - y;
        };

        function multiply (x,y) {
          x * y;
        };


        multiply(subtract(add(2, 2), 3), 42);
      `;

      expect(this.compiler(program)).toEqual(42);
    });
  });
});
