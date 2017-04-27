import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import ShareIcon from 'material-ui/svg-icons/av/library-books';
// eslint-disable-next-line
import ShareIcon2 from 'material-ui/svg-icons/content/content-copy';
// eslint-disable-next-line
import ShareIcon3 from 'material-ui/svg-icons/editor/insert-drive-file';
// eslint-disable-next-line
import ShareIcon4 from 'material-ui/svg-icons/image/filter-9-plus';
// eslint-disable-next-line
import ShareIcon5 from 'material-ui/svg-icons/image/filter-none';
// eslint-disable-next-line
import ShareIcon6 from 'material-ui/svg-icons/maps/layers';

export default class Versions extends Component {

  render() {
    return (
      <IconButton><ShareIcon color={'white'} /></IconButton>
      /*<IconButton><ShareIcon2 /></IconButton>
      <IconButton><ShareIcon3 /></IconButton>
      <IconButton><ShareIcon4 /></IconButton>
      <IconButton><ShareIcon5 /></IconButton>
      <IconButton><ShareIcon6 /></IconButton>*/
    );
}
}