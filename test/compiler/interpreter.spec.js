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
        { type: 'Unexpected' }
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

  describe('initialization and assignment', function () {
    describe('initialization', function () {
     it ('returns its value', function () {
       const tree = [
         {
           type: 'Initialization',
           left: { type: 'Identifier', value: 'a' },
           right: { type: 'Number', value: '100' }
           }
         ];

        expect(this.interpreter(tree)).toEqual(100);
      });
    });

    describe('re-assignment', function () {
      it ('returns its value', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Equals',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '33' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(33);
      });
    });

    describe('reading values', function () {
      it ('allows reading the "a" variable later', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'b' },
            right: { type: 'Number', value: '200' }
          },
          {
            'type': 'Identifier',
            'value': 'a'
          }
        ];

        expect(this.interpreter(tree)).toEqual(100);
      });

      it ('allows reading the "b" variable later', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'b' },
            right: { type: 'Number', value: '200' }
          },
          {
            type: 'Identifier',
            value: 'b'
          }
        ];

        expect(this.interpreter(tree)).toEqual(200);
      });

      it ('allows reading false', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'b' },
            right: { type: 'False', value: 'False' }
          },
          {
            type: 'Identifier',
            value: 'b'
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it ('allows reading 0', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'b' },
            right: { type: 'Number', value: '0' }
          },
          {
            type: 'Identifier',
            value: 'b'
          }
        ];

        expect(this.interpreter(tree)).toEqual(0);
      });
    });

    it('returns an an error if undefined variables are accessed', function () {
      const tree = [
        { type: 'Identifier', value: 'foo' }
      ];

      expect(() => this.interpreter(tree)).toThrow(new Error("Undefined variable 'foo'"));
    });
  });

  describe('blocks', function () {
    describe('returning values', function () {
      it ('returns value of the block', function () {
        const tree = [
          {
            type: 'Block',
            value: [
              { type: 'Number', value: '1337' }
            ]
          }
        ];

        expect(this.interpreter(tree)).toEqual(1337)
      });
    });

    describe('variable scope', function () {
      it('can creates new initialized variables inside the new scope', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '1' }
          },
          {
            type: 'Block',
            value: [
              {
                type: 'Initialization',
                left: { type: 'Identifier', value: 'a' },
                right: { type: 'Number', value: '4' }
              }
            ]
          },
          { type: 'Identifier', value: 'a' }
        ];

        expect(this.interpreter(tree)).toEqual(1)
      });

      it('looks in parent scope if variables are undefined within the current scope', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Block',
            value: [
              { type: 'Identifier', value: 'a' }
            ]
          }
        ];

        expect(this.interpreter(tree)).toEqual(100)
      });

      it('can update values in the parent scope', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Block',
            value: [
              { type: 'Identifier', value: 'a' }
            ]
          }
        ];

        expect(this.interpreter(tree)).toEqual(100)
      });

      it('returns an an error if accesing an undeclared variable in the new scope', function () {
        const tree = [
          {
            type: 'Initialization',
            left: { type: 'Identifier', value: 'a' },
            right: { type: 'Number', value: '100' }
          },
          {
            type: 'Block',
            value: [
              { type: 'Identifier', value: 'b' }
            ]
          }
        ];

        expect(() => this.interpreter(tree)).toThrow(new Error("Undefined variable 'b'"));
      });

      it('variables declared inside the new scope are not accessible outside', function () {
        const tree = [
          {
            type: 'Block',
            value: [
              {
                type: 'Initialization',
                left: { type: 'Identifier', value: 'a' },
                right: { type: 'Number', value: '100' }
              }
            ]
          },
          { type: 'Identifier', value: 'a' }
        ];

        expect(() => this.interpreter(tree)).toThrow(new Error("Undefined variable 'a'"));
      });
    });
  });

  describe('If', function () {
    describe ('when the condition is true', function () {
      it ('returns the left branch', function () {
        const tree = [
          {
            type: 'If',
            condition: { type: 'True', value: 'True' },
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(1);
      });
    });

    describe ('when the condition is false', function () {
      it ('returns the right branch', function () {
        const tree = [
          {
            type: 'If',
            condition: { type: 'False', value: 'False' },
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '0' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(0);
      });
    });
  });

  describe('while', function () {
    describe('when the condition is true at least once', function () {
      xit ('returns null', function () {
        const tree = [
          {
            type: 'While',
            condition: { type: 'False', value: 'False' },
            value: [ ]
          }
        ];

        expect(this.interpreter(tree)).toEqual(1);
      });
    });

    describe('when the condition is false', function () {
      it ('returns null', function () {
        const tree = [
          {
            type: 'While',
            condition: { type: 'False', value: 'False' },
            value: [ ]
          }
        ];

        expect(this.interpreter(tree)).toEqual(null);
      });
    });
  });

  describe('array creation', function (){
    it ('supports creating an empty array', function () {
      it ('returns true', function () {
        const tree = [
          {
            type: 'Array',
            value: []
          }
        ];

        expect(this.interpreter(tree)).toEqual([]);
      });
    });

    it ('supports creating an array with one element', function () {
      it ('returns true', function () {
        const tree = [
          {
            type: 'Array',
            value: [
              { type: 'Number', value: '1' }
            ]
          }
        ];

        expect(this.interpreter(tree)).toEqual([1]);
      });
    });

    it ('supports creating an array with multiple elements', function () {
      it ('returns true', function () {
        const tree = [
          {
            type: 'Array',
            value: [
              { type: 'Number', value: '1' },
              { type: 'Number', value: '2' },
              { type: 'Number', value: '3' }
            ]
          }
        ];

        expect(this.interpreter(tree)).toEqual([1, 2, 3]);
      });
    });
  });

  describe('predicates', function () {
    describe('True', function () {
      it ('returns true', function () {
        const tree = [
          { type: 'True', value: 'True' }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });
    });

    describe('True', function () {
      it ('returns false', function () {
        const tree = [
          { type: 'False', value: 'False' }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });
    });

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

    describe ('==', function () {
      it('returns true when equal', function () {
        const tree = [
          {
            type: 'EqualsEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns false when not equal', function () {
        const tree = [
          {
            type: 'EqualsEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '2' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns does not perform tye coercion', function () {
        const tree = [
          {
            type: 'EqualsEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'String', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });
    });

    describe ('==', function () {
      it('returns false when equal', function () {
        const tree = [
          {
            type: 'NotEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(false);
      });

      it('returns true when not equal', function () {
        const tree = [
          {
            type: 'NotEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'Number', value: '2' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });

      it('returns does not perform tye coercion', function () {
        const tree = [
          {
            type: 'NotEquals',
            left: { type: 'Number', value: '1' },
            right: { type: 'String', value: '1' }
          }
        ];

        expect(this.interpreter(tree)).toEqual(true);
      });
    });
  });
});
