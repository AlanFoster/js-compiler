import ParseError from './parse-error';

class UnexpectedTokenError extends ParseError {
  constructor({ expected, actual }) {
    super({
      message: `Unable to parse. Expected token '${expected}' instead got '${_.result(actual, 'type')}'`,
      token: actual
    });
  }
}

export default UnexpectedTokenError;
