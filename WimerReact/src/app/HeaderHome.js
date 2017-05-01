import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import UserManagement from './HeaderModules/UserManagement';

import {
  withRouter,
} from 'react-router-dom';

@withRouter
export default class HeaderHome extends Component {

  render() {
    return (
      <AppBar
        title='Wimer'
        iconElementLeft={
          <IconButton><MenuIcon /></IconButton>
        }
        iconElementRight={
          <UserManagement />
        }
        style={{ position: 'fixed', top: 0 }} />
    );
  }
}