import React from 'react';

const LexerExample = React.createClass({
	renderOutput(src, compiler) {
		const result = compiler.lexer(src);
		return (
			<pre>{JSON.stringify(result, undefined, 4)}</pre>
		);
	},

	render() {
		const { src, compiler } = this.props;

		return (
			<div>
				<h2>Lexing</h2>
				<div>Input Source:</div>
				<pre>
					{src}
				</pre>
				<div>Output:</div>
				<div>{this.renderOutput(src, compiler)}</div>
			</div>
		);
	}
});

const App = React.createClass({
	render() {
		const src = `
			var x = y;'
		`;

		return (
			<div>
				<div>Loaded Modules...</div>
				<div>{Object.keys(this.props.compiler).join(', ')}</div>

				<LexerExample src={src} compiler={this.props.compiler} />
			</div>
		);
	}
});

export default App;
