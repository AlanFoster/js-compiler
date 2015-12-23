import React from 'react';
import _ from 'lodash';
import CodeEditor from './code-editor';
import Lexer from './lexer';
import Parser from './parser';
import Interpreter from './interpreter';

const App = React.createClass({
  getInitialState() {
    return {
      src: (
        window.location.hash.substring(1) ||
        window.localStorage.src ||
        '1 + 1'
      )
    };
  },

  onChange(src) {
    window.location.hash = src;
    window.localStorage.src = src;
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
          <Interpreter src={this.state.src} compiler={this.props.compiler} />
        </div>
      </div>
    );
  }
});

export default App;
