import CompilerError from './compiler-error';

class UnexpectedTokenError extends CompilerError {
  constructor({ expected, actual }) {
    super({
      message: `Unable to parse. Expected token '${expected}' instead got '${_.result(actual, 'type')}'`,
      token: actual
    });
  }
}

export default UnexpectedTokenError;
