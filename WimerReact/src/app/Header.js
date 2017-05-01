import React, { Component } from 'react';
import HeaderHome from './HeaderHome';
import HeaderDocument from './HeaderDocument';

import {
  Route,
  withRouter,
} from 'react-router-dom';
import { inject, observer } from 'mobx-react';

@withRouter
@inject('documentStore')
@observer
export default class Header extends Component {

  componentWillMount() {
    console.log('Header props:', this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log('Header props:', nextProps);
  }

  render() {
    return (
      <div>
        <Route exact path="/" component={HeaderHome} />
        <Route exact path="/document/:documentId/:userId" component={HeaderDocument} />
      </div>
    );
  }
}