import React, { Component } from 'react';
import Header from './Header';
import Body from './Body';
import {
  BrowserRouter as Router,
} from 'react-router-dom';

export default class Page extends Component {

  render() {
    return (
      <Router >
        <div>
          <Header />
          <Body />
        </div>
      </Router>
    );
  }
}