import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
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
import { List, ListItem } from 'material-ui/List';

import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

@withRouter
@inject('documentStore')
@observer
export default class Versions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showList: false,
    }
  }

  changeListState = () => {
    this.setState({ showList: !this.state.showList })
  }

  render() {
    return (
      <div>
        <IconButton onTouchTap={this.changeListState}><ShareIcon color={'white'} /></IconButton>
        {this.state.showList &&
          <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}
            onClick={() => this.changeListState()} >
            <Paper style={{ position: 'absolute', maxHeight: 490, width: 300, right: 10, top: 56, overflowY: 'scroll' }}>
              <List>
                {this.props.documentStore.versions.map((version) =>
                  <ListItem primaryText={version.name} secondaryText={version.title}
                    onTouchTap={() => this.props.history.push(`/document/${version.id}/${version.userId}`)}
                  />
                )}
              </List>
            </Paper>
          </div>
        }
      </div>
      /*<IconButton onTouchTap={this.changeListState}><ShareIcon2 /></IconButton>
      <IconButton onTouchTap={this.changeListState}><ShareIcon3 /></IconButton>
      <IconButton onTouchTap={this.changeListState}><ShareIcon4 /></IconButton>
      <IconButton onTouchTap={this.changeListState}><ShareIcon5 /></IconButton>
      <IconButton onTouchTap={this.changeListState}><ShareIcon6 /></IconButton>*/
    );
  }
}