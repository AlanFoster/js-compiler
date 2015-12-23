import Tokens from '../tokens';
import _ from 'lodash';

const operators = {
  [Tokens.Plus]: (a, b = 0) => a + b,
  [Tokens.Minus]: (a, b) => (typeof b === 'undefined') ? -a : a - b,
  [Tokens.Multiply]: (a, b) => a * b,
  [Tokens.Divide]: (a, b) => a / b
};

const firstMatchingResult = function ([head, ...tail], ...args) {
  const result = head.call(this, ...args);
  if (typeof result !== 'undefined') return result;
  return firstMatchingResult(tail, ...args);
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

  visitLiteral(node) {
    if (node.type === Tokens.Number) {
      return parseFloat(node.value);
    } else if (node.type === Tokens.String) {
      return node.value;
    }
  }

  error(node) {
    throw new Error(`Unexpected node type '${node.type}'`);
  }
}


export default function (tree) {
  return new Interpreter().walk(tree)
};
