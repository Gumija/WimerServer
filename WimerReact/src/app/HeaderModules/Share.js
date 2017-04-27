import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import ShareIcon from 'material-ui/svg-icons/social/share';

export default class Share extends Component {

  render() {
    return (
      <IconButton><ShareIcon color={'white'} /></IconButton>
    );
  }
}