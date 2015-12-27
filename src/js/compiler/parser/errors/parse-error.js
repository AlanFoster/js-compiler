class ParseError extends Error {
  constructor({ message, token }) {
    super(message);
    this.name = 'ParseError';
    this.token = token;
    this.message = message;
    this.stack = (new Error()).stack;
  }
}

export default ParseError;
