import React from 'react';
import attempt from './attempt';
import _ from 'lodash';

const ParserExample = React.createClass({
  renderOutput(src, compiler) {
    let result = attempt(() => compiler.compile(src));

    return (
      <pre>{this.textForResult(src, result)}</pre>
    );
  },

  textForResult(src, result) {
    if (!_.isNumber(_.get(result, 'token.from'))) return JSON.stringify(result, null, 4);

    const { from, to } = result.token;

    const linesWithErrorAcc = _.reduce(src.split(/\n/), function (acc, nextLine) {
      const isErrorBetweenLine = (acc.count <= from) && ((acc.count + nextLine.length + 1) >= from);
      const errorDistance = (acc.count - from) * -1;

      acc.count += nextLine.length + 1;
      acc.lines.push(nextLine);

      if (isErrorBetweenLine && ! acc.hasReportedError) {
        const leftPadding = _.repeat(' ', errorDistance);
        const errorLength = to - from;
        const errorRange = _.repeat('*', errorLength);

        acc.lines.push(leftPadding + errorRange);
        acc.lines.push(leftPadding + '^ ' + result.message);
        acc.hasReportedError = true;
      }

      return acc;
    }, { lines: [], count: 0, hasReportedError: false });

    return linesWithErrorAcc.lines.join('\n');
  },

  render() {
    const { src, compiler } = this.props;

    return (
      <div className='interpreter'>
        <pre>{this.renderOutput(src, compiler)}</pre>
      </div>
    );
  }
});

export default ParserExample;
