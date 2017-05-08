import React, { Component } from 'react';
import {
  Route
} from 'react-router-dom';
import Home from './Home';
import DocumentViewContainer from './DocumentViewContainer';
import UserService from './services/UserService';


export default class Body extends Component {

  componentWillMount(){
    UserService.getAndStoreCurrentUser();
  }

  render() {
    return (
      /* Used to center stuff. This will be Navigated */
        <div style={{paddingTop: 64}}>
          <Route exact path="/" component={Home} />
          <Route path="/document/:documentId/:userId" component={DocumentViewContainer} />
        </div >
    );
  }
}