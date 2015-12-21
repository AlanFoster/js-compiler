import React from 'react';

const LexerExample = React.createClass({
  renderOutput(src, compiler) {
    const result = compiler.lexer(src);
    return (
      <pre>{JSON.stringify(result, null, 4)}</pre>
    );
  },

  render() {
    const { src, compiler } = this.props;

    return (
      <div>
        <h2>Lexing</h2>
        <div>Input Source:</div>

        <div>Output:</div>
        <div>{this.renderOutput(src, compiler)}</div>
      </div>
    );
  }
});

export default LexerExample;
