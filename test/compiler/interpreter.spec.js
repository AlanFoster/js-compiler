describe('Interpreter', function () {
  beforeEach(function () {
    this.interpreter = require('compiler/interpreter').default;
  });

  describe('when the tree is empty', function () {
    it ('should return undefined', function() {
      expect(this.interpreter([])).toEqual(undefined);
    });
  });

  describe('when the tree has an unexpected node', function () {
    it ('should return an error', function() {
      const tree = [
        { type: 'Unexpected'}
      ];

      expect(() => this.interpreter(tree)).toThrow(new Error("Unexpected node type 'Unexpected'"));
    });
  });

  describe ('simple trees', function () {
    describe('when only a number is present', function () {
      it ('return the numbers value when positive', function () {
        const tree = [
          { type: 'Number', value: '42' }
        ];

        expect(this.interpreter(tree)).toEqual(42);
      });

      it ('return the numbers value when zero', function () {
        const tree = [
          { type: 'Number', value: '0' }
        ];

        expect(this.interpreter(tree)).toEqual(0);
      });
    });



    describe('when only a string is present', function () {
      it ('return the numbers value', function () {
        const tree = [
          { type: 'String', value: 'hello world' }
        ];

        expect(this.interpreter(tree)).toEqual('hello world');
      });
    });
  });

  describe('infix operators', function () {
    it ('adds two numbers', function () {
      const tree = [
        {
          type: 'Plus',
          left: { type: 'Number', value: '1' },
          right: { type: 'Number', value: '1' }
        }
      ];

      expect(this.interpreter(tree)).toEqual(2);
    });

    it ('multiples two numbers', function () {
      const tree = [
        {
          type: 'Multiply',
          left: { type: 'Number', value: '2' },
          right: { type: 'Number', value: '3' }
        }
      ];

      expect(this.interpreter(tree)).toEqual(6);
    });

    it ('subtracts two numbers', function () {
      const tree = [
        {
          type: 'Minus',
          left: { type: 'Number', value: '2' },
          right: { type: 'Number', value: '3' }
        }
      ];

      expect(this.interpreter(tree)).toEqual(-1);
    });

    it ('works when the result is 0', function () {
      const tree = [
        {
          type: 'Plus',
          left: { type: 'Number', value: '0' },
          right: { type: 'Number', value: '0' }
        }
      ];

      expect(this.interpreter(tree)).toEqual(0);
    });

    it ('works with 100 + 100 / 2', function () {
      const tree = [
        {
          type: "Plus",
          left: {
            type: "Number",
            value: "100"
          },
          right: {
            type: "Divide",
            left: {
              type: "Number",
              value: "100"
            },
            right: {
              type: "Number",
              value: "2"
            }
          }
        }
      ];

      expect(this.interpreter(tree)).toEqual(150);
    });
  });

  describe('assignment', function () {
    it ('assignment returns its value', function () {
      const tree = [
        {
          type: "Equals",
          left: {
            type: "Identifier",
            value: "a"
          },
          right: { type: "Number", value: "100" }
        }
      ];

      expect(this.interpreter(tree)).toEqual(100);
    });
  });

  describe('predicates', function () {
    describe ('>', function () {
      it('returns true when LHS is greater than', function () {
        const tree = [
          {
            type: 'GreaterThan',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns false when LHS is the same as', function () {
        const tree = [
          {
            type: 'GreaterThan',
            left: { type: 'Number', value: '0' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns false when LHS is less than', function () {
        const tree = [
          {
            type: 'GreaterThan',
            left: { type: 'Number', value: '-1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });
    });

    describe ('>=', function () {
      it('returns true when LHS is greater than', function () {
        const tree = [
          {
            type: 'GreaterThanEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns true when LHS is the same as', function () {
        const tree = [
          {
            type: 'GreaterThanEquals',
            left: { type: 'Number', value: '0' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns false when LHS is less than', function () {
        const tree = [
          {
            type: 'GreaterThanEquals',
            left: { type: 'Number', value: '-1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });
    });

    describe ('<', function () {
      it('returns false when LHS is greater than', function () {
        const tree = [
          {
            type: 'LessThan',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns false when LHS is the same as', function () {
        const tree = [
          {
            type: 'LessThan',
            left: { type: 'Number', value: '0' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns true when LHS is less than', function () {
        const tree = [
          {
            type: 'LessThan',
            left: { type: 'Number', value: '-1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });
    });

    describe ('<=', function () {
      it('returns false when LHS is greater than', function () {
        const tree = [
          {
            type: 'LessThanEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns true when LHS is the same as', function () {
        const tree = [
          {
            type: 'LessThanEquals',
            left: { type: 'Number', value: '0' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns true when LHS is less than', function () {
        const tree = [
          {
            type: 'LessThanEquals',
            left: { type: 'Number', value: '-1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });
    });
  });
});
