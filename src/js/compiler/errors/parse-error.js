import CompilerError from './compiler-error';

class ParseError extends CompilerError {
  constructor(...args) {
    super(...args);
  }
}

export default ParseError;
