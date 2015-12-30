import React from 'react';

const CodeEditor = React.createClass({
  getDefaultProps() {
    return {
      onChange: _.noop
    }
  },

  onChange(e) {
    this.props.onChange(e.target.value);
  },

  render() {
    return (
      <div className='code-editor'>
        <textarea onChange={this.onChange} value={this.props.src} />
      </div>
    )
  }
});


export default CodeEditor;
