import React from 'react';
import _ from 'lodash';
import CodeEditor from './code-editor';
import Lexer from './lexer';
import Parser from './parser';
import Interpreter from './interpreter';

import ExampleSelection from './example-selection';
import examples from './examples';

const App = React.createClass({
  getInitialState() {
    return {
      example: {
        label: (
          window.localStorage.label ||
          _.first(examples).label
        ),
        value: (
          decodeURIComponent(window.location.hash.substring(1)) ||
          window.localStorage.src ||
          _.first(examples.src)
        )
      }
    };
  },

  onChange(value) {
    this.updateState({ value })
  },

  onExampleChange({ label, value }) {
    this.updateState({ label, value });
  },

  updateState({ label = this.state.example.label,
                value = this.state.example.value }) {
    window.location.hash = value;
    const example = {
      label,
      value
    };
    window.localStorage.example = {
      label,
      value
    };
    this.setState({ example });
  },

  render() {
    const { label, value: src } = this.state.example;
    const selectedOption = _.findWhere(examples, { label });

    return (
      <div className='app'>
        <div className='editing'>
          <div className='input'>
            <h2>Code Editor</h2>
            <ExampleSelection onChange={this.onExampleChange}
                              options={examples}
                              value={selectedOption} />
            <CodeEditor src={src} onChange={this.onChange} />
          </div>

          <div className='result'>
            <h2>Result</h2>
            <Interpreter src={src} compiler={this.props.compiler} />
          </div>
        </div>

        <div className='stages'>
          <div className='lexer'>
            <h2>Lexer</h2>
            <Lexer src={src} compiler={this.props.compiler} />
          </div>

          <div className='parser'>
            <h2>Parser</h2>
            <Parser src={src} compiler={this.props.compiler} />
          </div>
        </div>
      </div>
    );
  }
});

export default App;
