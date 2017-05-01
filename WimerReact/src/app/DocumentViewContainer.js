import React, { Component } from 'react';
import DocumentService from './services/DocumentService';
import HighlightService from './services/HighlightService';
import DocumentView from './DocumentView';

import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

@withRouter
@inject('documentStore', 'userStore')
@observer
export default class DocumentViewContainer extends Component {

  async componentWillMount() {
    let documentId = parseInt(this.props.match.params.documentId, 10);
    let userId = parseInt(this.props.match.params.userId, 10);
    await DocumentService.getDocument(documentId, userId);
    let document = this.props.documentStore.docInfos.find((doc) => doc.id === documentId);
    this.props.documentStore.setCurrentFile({ id: document.id, file: await DocumentService.getFile(document) })
    this.props.documentStore.setHighlights({ id: documentId, str: await HighlightService.getHighlights(documentId) });
  }

  onHighlightAdded = (hl) => {
    // Post to server
    console.log('Added', hl);
    HighlightService.addHighlight(hl);
  }

  onHighlightRemoved = (hl) => {
    // Remove from server
    console.log('Removed', hl);
    HighlightService.removeHighlight(hl);
  }

  render() {
    // eslint-disable-next-line
    let document = this.props.documentStore.docInfos.find((doc) => 
      doc.id === parseInt(this.props.match.params.documentId, 10) &&
      doc.userId === parseInt(this.props.match.params.userId, 10));
    let loading = document &&
      document.id === this.props.documentStore.currentFile.id &&
      document.id === this.props.documentStore.highlightsString.id;
    return (
      <DocumentView
        document={document}
        file={this.props.documentStore.currentFile}
        highlightsString={this.props.documentStore.highlightsString}
        loading={loading}
        onHighlightAdded={this.onHighlightAdded}
        onHighlightRemoved={this.onHighlightRemoved}
        user={this.props.userStore.currentUser}
      />
    );
  }
}