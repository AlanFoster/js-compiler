import Tokens from '../tokens';
import _ from 'lodash';

const operators = {
  [Tokens.Plus]: (a, b = 0) => a + b,
  [Tokens.Minus]: (a, b) => (typeof b === 'undefined') ? -a : a - b,
  [Tokens.Multiply]: (a, b) => a * b,
  [Tokens.Divide]: (a, b) => a / b,
  [Tokens.GreaterThan]: (a, b) => a > b,
  [Tokens.GreaterThanEquals]: (a, b) => a >= b,
  [Tokens.LessThan]: (a, b) => a < b,
  [Tokens.LessThanEquals]: (a, b) => a <= b
};

const constants = {
  [Tokens.Number]: (node) => parseFloat(node.value),
  [Tokens.String]: (node) => node.value,
  [Tokens.True]: () => true,
  [Tokens.False]: () => false
};

const firstMatchingResult = function ([head, ...tail], ...args) {
  const result = head.call(this, ...args);
  if (typeof result !== 'undefined') return result;
  return firstMatchingResult.call(this, tail, ...args);
};

class Interpreter {
  walk(tree) {
    const root = tree[0];
    if (!root) return undefined;

    return this.visitNode(root);
  }

  visitNode(node) {
    return firstMatchingResult.call(this, [
      this.visitOperator,
      this.visitLiteral,
      this.visitAssignment,
      this.visitTernary,
      this.error
    ], node);
  }

  visitOperator(node) {
    const matchingOperator = operators[node.type];
    if (!matchingOperator) return;

    const { left, right } = node;

    if (left) {
      return matchingOperator(this.visitNode(left), this.visitNode(right))
    }

    return matchingOperator(this.visitNode(right));
  }

  visitAssignment(node) {
    if (node.type !== Tokens.Equals) return;
    // TODO Place assignment into a symbol table
    return this.visitNode(node.right);
  }

  visitLiteral(node) {
    const matchedLiteral = constants[node.type];
    if (!matchedLiteral) return;

    return matchedLiteral(node);
  }

  visitTernary(node) {
    if (node.type !== 'Ternary') return;

    const branch = this.visitNode(node.condition) ? node.left : node.right;
    return this.visitNode(branch);
  }

  error(node) {
    throw new Error(`Unexpected node type '${node.type}'`);
  }
}


export default function (tree) {
  return new Interpreter().walk(tree)
};
