import lexer from './lexer';
import parser from './parser';
import interpreter from './interpreter';

export default {
  lexer,
  parser,
  interpreter,
  compile(input) {
    return interpreter(parser(lexer(input)));
  }
};
