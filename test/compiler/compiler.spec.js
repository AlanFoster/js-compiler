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
  })
});
