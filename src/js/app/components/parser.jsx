import React from 'react';

const ParserExample = React.createClass({
  renderOutput(src, compiler) {
    const result = compiler.parser(compiler.lexer(src));
    return (
      <pre>{JSON.stringify(result, null, 4)}</pre>
    );
  },

  render() {
    const { src, compiler } = this.props;

    return (
      <div className='Parser'>
        <h2>Parser</h2>
        <div>{this.renderOutput(src, compiler)}</div>
      </div>
    );
  }
});

export default ParserExample;
