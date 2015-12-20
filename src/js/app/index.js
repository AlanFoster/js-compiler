import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import compiler from '../compiler';

window.onload = function () {
  ReactDOM.render(<App compiler={compiler}/>, document.getElementById('app'));
};