import React from 'react';

const App = React.createClass({
	render() {
		return (
			<div>
				<div>Loaded Modules...</div>
				<div>{Object.keys(this.props.compiler).join(', ')}</div>
			</div>
			)
	}
});

export default App;