import React from 'react';
import attempt from './attempt';

const ParserExample = React.createClass({
  renderOutput(src, compiler) {
    const result = attempt(() => compiler.parser(compiler.lexer(src)));
    return (
      <pre>{JSON.stringify(result, null, 4)}</pre>
    );
  },

  render() {
    const { src, compiler } = this.props;

    return (
      <div className='parser'>
        <h2>Parser</h2>
        <div>{this.renderOutput(src, compiler)}</div>
      </div>
    );
  }
});

export default ParserExample;
