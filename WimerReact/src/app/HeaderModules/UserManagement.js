
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Redirect } from 'react-router'

import { inject, observer } from 'mobx-react';

@inject('userStore')
@observer
export default class UserManagerment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
    }
  }

  onLogout = () => {
    fetch('/logout');
    this.props.userStore.setCurrentUser(undefined);
    this.setState({ redirect: true })
  }

  render() {
    let button;
    if (this.props.userStore.currentUser) {
      button = (
        <RaisedButton onTouchTap={this.onLogout} label="Logout" />
      )
    } else {
      button = (
        <a href='/auth/google'>
          <RaisedButton label="Login" />
        </a>
      )
    }
    return (
      <div>
        {this.state.redirect ?
          <Redirect to='/' />
          :
          <a href='/auth/google'>
            {button}
          </a>
        }
      </div>
    );
  }
}