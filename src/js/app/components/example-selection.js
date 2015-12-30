import React from 'react';
import Select from 'react-select';
import { } from 'react-select/dist/react-select.css';

const ExampleSelection = React.createClass({
  render() {
    return (
      <Select className='example-selection'
              options={this.props.options}
              value={this.props.value}
              onChange={this.props.onChange}
              clearable={false} />
    );
  }
});

export default ExampleSelection;
