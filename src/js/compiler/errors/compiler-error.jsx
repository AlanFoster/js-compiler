class CompilerError extends Error {
  constructor({ message, token }) {
    super(message);
    this.name = 'CompilerError';
    this.token = token;
    this.message = message;
    this.stack = (new Error()).stack;
  }
}

export default CompilerError;
