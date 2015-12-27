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

class DeadEnvironment {
  static get(identifier) {
    throw new Error(`Undefined variable '${identifier}'`);
  }
}

class Environment {
  constructor(parent = DeadEnvironment) {
    this.environment = {};
    this.parent = parent;
  }

  add(identifier, value) {
    this.environment[identifier] = value;
  }

  get(identifier) {
    const hasIdentifier = _.has(this.environment, identifier);
    return hasIdentifier ? this.environment[identifier]
                         : this.parent.get(identifier);
  }

  push() {
    return new Environment(this);
  }

  pop() {
    return this.parent;
  }
}

class Interpreter {
  constructor() {
    this.environment = new Environment();
  }

  walk(statements = []) {
    if (statements.length === 0) return undefined;

    return this.lastStatementOf(statements);
  }

  lastStatementOf([head, ...tail]) {
    if (_.isEmpty(tail)) return this.visitNode(head);

    this.visitNode(head);
    return this.lastStatementOf(tail);
  }

  visitNode(node) {
    return firstMatchingResult.call(this, [
      this.visitOperator,
      this.visitLiteral,
      this.visitAssignment,
      this.visitTernary,
      this.visitArray,
      this.visitBlock,
      this.visitIdentifier,
      this.visitFunction,
      this.visitApplication,
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

  visitFunction(node) {
    if (node.type !== 'Function') return;

    const func = (function (args) {
      const newEnvironment = this.environment.push();
      this.environment = newEnvironment;
      _.each(_.object(node.args, args), function (value, identifier) {
        newEnvironment.add(identifier, value);
      });
      const value = this.walk(node.value);
      this.environment = this.environment.pop();

      return value;
    }).bind(this);

    this.environment.add(node.identifier, func);

    return func;
  }

  visitApplication(node) {
    if (node.type !== 'Application') return;

    const lhs = this.visitNode(node.left);
    const args = _.map(node.args, (node) => this.visitNode(node));
    return lhs.call(undefined, args);
  }

  visitBlock(node) {
    if (node.type !== 'Block') return;

    this.environment = this.environment.push();
    const result = this.walk(node.value);
    this.environment = this.environment.pop();
    return result;
  }

  visitIdentifier(node) {
    if (node.type !== Tokens.Identifier) return;

    return this.environment.get(node.value);
  }

  visitAssignment(node) {
    if (node.type !== Tokens.Equals) return;
    const value = this.visitNode(node.right);
    // TODO lhs may be an expression?
    const identifier = node.left.value;

    this.environment.add(identifier, value);

    return value;
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

  visitArray(node)  {
    if (node.type !== 'Array') return;

    return _.map(node.value, (arrayNode) => this.visitNode(arrayNode));
  }

  error(node) {
    throw new Error(`Unexpected node type '${node.type}'`);
  }
}


export default function (tree) {
  return new Interpreter().walk(tree)
};
