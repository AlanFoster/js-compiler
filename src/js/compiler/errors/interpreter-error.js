import CompilerError from './compiler-error';

class InterpreterError extends CompilerError {
  constructor(...args) {
    super(...args);
  }
}

export default InterpreterError;
