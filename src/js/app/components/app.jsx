import React from 'react';
import _ from 'lodash';
import CodeEditor from './code-editor';
import Lexer from './lexer';

const App = React.createClass({
  getInitialState() {
    return {
      src: 'var x = 10;'
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
        <Lexer src={this.state.src} compiler={this.props.compiler} />
      </div>
    );
  }
});

export default App;
