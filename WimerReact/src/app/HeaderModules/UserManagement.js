
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class UserManagerment extends Component {

  LoginPressed = () => {
    fetch('/auth/google/',{
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin':'https://morning-stream-82096.herokuapp.com',
      }
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