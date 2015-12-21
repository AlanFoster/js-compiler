import React from 'react';
import _ from 'lodash';
import CodeEditor from './code-editor';
import Lexer from './lexer';
import Parser from './parser';

const App = React.createClass({
  getInitialState() {
    return {
      src: 'var x = "hello world";'
    };
  },

  onChange(src) {
    this.setState({ src })
  },

  render() {
    return (
      <div>
        <div>Loaded Modules...</div>
        <div>{Object.keys(this.props.compiler).join(', ')}</div>

        <CodeEditor src={this.state.src} onChange={this.onChange} />

        <div className='stages'>
          <Lexer src={this.state.src} compiler={this.props.compiler} />
          <Parser src={this.state.src} compiler={this.props.compiler} />
        </div>
      </div>
    );
  }
});

export default App;
