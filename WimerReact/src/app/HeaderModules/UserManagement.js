
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class UserManagerment extends Component {

  LoginPressed = () => {
    fetch('/auth/google/',{
      method: 'POST',
    })
  }

  render() {
    return (
      <div>
        {/*<a href='/auth/google'>*/}
          <RaisedButton onTouchTap={this.LoginPressed} label="Login" style={{ marginLeft: 12 }} />
        {/*</a>*/}
      </div>
    );
  }
}