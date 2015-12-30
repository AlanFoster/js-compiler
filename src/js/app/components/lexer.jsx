import React from 'react';
import attempt from './attempt';

const LexerExample = React.createClass({
  renderOutput(src, compiler) {
    const result = attempt(() => compiler.lexer(src));
    return (
      <pre>{JSON.stringify(result, null, 4)}</pre>
    );
  },

  render() {
    const { src, compiler } = this.props;

    return (
      <div className='lexer'>
        <div>{this.renderOutput(src, compiler)}</div>
      </div>
    );
  }
});

export default LexerExample;
