import Tokens from '../tokens';
import _ from 'lodash';

const operators = {
  [Tokens.Plus]: (a, b = 0) => a + b,
  [Tokens.Minus]: (a, b) => (typeof b === 'undefined') ? -a : a - b,
  [Tokens.Multiply]: (a, b) => a * b,
  [Tokens.Divide]: (a, b) => a / b,
  [Tokens.NotEquals]: (a, b) => a !== b,
  [Tokens.EqualsEquals]: (a, b) => a === b,
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

  static update(identifier, value) {
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

  update(identifier, value) {
    const hasIdentifier = _.has(this.environment, identifier);
    if (!hasIdentifier) return this.parent.update(identifier, value);

    this.add(identifier, value);
  }

  get(identifier) {
    const hasIdentifier = _.has(this.environment, identifier);
    return hasIdentifier ? this.environment[identifier]
                         : this.parent.get(identifier);
  }

  create() {
    return new Environment(this);
  }

  pop() {
    return this.parent;
  }
}

class Interpreter {
  walk(statements = [], environment) {
    if (statements.length === 0) return undefined;

    return this.lastStatementOf(statements, environment);
  }

  lastStatementOf([head, ...tail], environment) {
    if (_.isEmpty(tail)) return this.visitNode(head, environment);

    this.visitNode(head, environment);
    return this.lastStatementOf(tail, environment);
  }

  visitNode(node, environment) {
    return firstMatchingResult.call(this, [
      this.visitOperator,
      this.visitLiteral,
      this.visitInitialization,
      this.visitAssignment,
      this.visitIf,
      this.visitArray,
      this.visitBlock,
      this.visitIdentifier,
      this.visitFunction,
      this.visitWhile,
      this.visitApplication,
      this.error
    ], node, environment);
  }

  visitOperator(node, environment) {
    const matchingOperator = operators[node.type];
    if (!matchingOperator) return;

    const { left, right } = node;

    if (left) {
      return matchingOperator(this.visitNode(left, environment), this.visitNode(right, environment))
    }

    return matchingOperator(this.visitNode(right, environment));
  }

  visitFunction(node, environment) {
    if (node.type !== 'Function') return;

    const func = (function (args) {
      const newEnvironment = environment.create();
      _.each(node.args, function (identifier, index) {
        newEnvironment.add(identifier, args[index] || null);
      });

      const value = this.walk(node.value, newEnvironment);

      return value;
    }).bind(this);

    environment.add(node.identifier, func);

    return func;
  }

  visitApplication(node, environment) {
    if (node.type !== 'Application') return;

    const lhs = this.visitNode(node.left, environment);
    const args = _.map(node.args, (node) => this.visitNode(node, environment));
    return lhs.call(undefined, args);
  }

  visitBlock(node, environment) {
    if (node.type !== 'Block') return;

    const newEnvironment = environment.create();
    const result = this.walk(node.value, newEnvironment);
    return result;
  }

  visitWhile(node, environment) {
    if (node.type !== 'While') return;

    while (this.visitNode(node.condition, environment)) {
      this.visitNode(node.value, environment);
    }

    return null;
  }

  visitIdentifier(node, environment) {
    if (node.type !== Tokens.Identifier) return;

    return environment.get(node.value);
  }

  visitInitialization(node, environment) {
    if (node.type !== 'Initialization') return;
    const value = this.visitNode(node.right, environment);
    const identifier = node.left.value;

    environment.add(identifier, value);

    return value;
  }

  visitAssignment(node, environment) {
    if (node.type !== Tokens.Equals) return;
    const value = this.visitNode(node.right, environment);
    const identifier = node.left.value;

    environment.update(identifier, value);

    return value;
  }

  visitLiteral(node, environment) {
    const matchedLiteral = constants[node.type];
    if (!matchedLiteral) return;

    return matchedLiteral(node);
  }

  visitIf(node, environment) {
    if (node.type !== 'If') return;

    const branch = this.visitNode(node.condition, environment) ? node.left : node.right;
    return this.visitNode(branch, environment);
  }

  visitArray(node, environment)  {
    if (node.type !== 'Array') return;

    return _.map(node.value, (arrayNode) => this.visitNode(arrayNode, environment));
  }

  error(node, environment) {
    throw new Error(`Unexpected node type '${node.type}'`);
  }
}


export default function (tree) {
  return new Interpreter().walk(tree, new Environment())
};
