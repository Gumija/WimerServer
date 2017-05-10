import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Versions from './HeaderModules/Versions';
import UserManagement from './HeaderModules/UserManagement';
import Dots from 'react-activity/lib/Dots';
import TextField from 'material-ui/TextField';
import DocumentService from './services/DocumentService';

import {
  withRouter,
  Link,
} from 'react-router-dom';
import { inject, observer } from 'mobx-react';

@withRouter
@inject('documentStore')
@observer
export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editting: false,
      title: '',
    }
  }

  editTitle = () => {
    console.log('editted', this.state.editting);
    let documentId = this.props.match.params.documentId;
    let userId = this.props.match.params.userId;
    if (this.state.editting) {
      if (this.state.title) {
        this.setState({ editting: !this.state.editting });
        let document = this.props.documentStore.docInfos.find((d) => d.id === documentId && d.userId === userId);
        document.title = this.state.title;
        // TODO: send to server title
        DocumentService.updateTitle(document);
      }
    } else {
      this.setState({
        editting: !this.state.editting,
        title: this.props.documentStore.docInfos.find((d) => d.id === documentId && d.userId === userId).title
      });
    }
  }

  render() {
    return (
      <AppBar
        title={this.props.match ?
          <div >
            {this.props.documentStore.docInfos.find((d) => d.id === this.props.match.params.documentId &&
              d.userId === this.props.match.params.userId) ?
              <div>
                {this.state.editting ?
                  <TextField
                    hintText="Document title"
                    errorText={!this.state.title ? "Title cannot be empty" : ""}
                    value={this.state.title}
                    onChange={(event, value) => this.setState({ title: value })}
                  />
                  :
                  <p style={{ margin: 0, display: 'inline-block' }}>
                    {this.props.documentStore.docInfos.find((d) => d.id === this.props.match.params.documentId &&
                      d.userId === this.props.match.params.userId).title}
                  </p>
                }
                {(!this.state.editting || this.state.title) &&
                  <IconButton onTouchTap={this.editTitle}>
                    <FontIcon className="material-icons" color={'white'}>{this.state.editting ? 'done' : 'edit'}</FontIcon>
                  </IconButton>
                }
              </div>

              :

              <Dots size={16} color="#FFF" />
            }
          </div>
          : "NULL"}
        iconElementLeft={
          <Link to="/">
            <IconButton onTouchTap={() => { }/*this.props.history.goBack()*/}>
              <FontIcon className="material-icons" color={'white'}>arrow_back</FontIcon>
            </IconButton>
          </Link>
        }
        iconElementRight={
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Versions />
            <UserManagement />
          </div>
        }
        style={{ position: 'fixed', top: 0 }} />
    );
  }
}