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
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    let documentId = this.props.match.params.documentId;
    let userId = this.props.match.params.userId;
    let nextdocumentId = nextProps.match.params.documentId;
    let nextUserId = nextProps.match.params.userId;
    if (documentId !== nextdocumentId || userId !== nextUserId) {
      this.init(nextProps);
    }
  }

  init = async (props) => {
    let documentId = props.match.params.documentId;
    let userId = props.match.params.userId;
    await DocumentService.getDocument(documentId, userId);
    let document = props.documentStore.docInfos.find((doc) => doc.id === documentId);
    this.props.documentStore.setCurrentFile({ id: document.id, file: await DocumentService.getFile(document) })
    this.props.documentStore.setHighlights({ id: documentId, str: await HighlightService.getHighlights(documentId, userId) });

    DocumentService.visited(documentId, userId);
    DocumentService.getVersions(documentId);
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

  onStartHighlighting = () => {
    let document = this.props.documentStore.docInfos.find((doc) =>
      doc.id === this.props.match.params.documentId &&
      doc.userId === this.props.match.params.userId);
    DocumentService.addOwnDocument(document.id);
    let userId = this.props.userStore.currentUser.id;
    this.props.history.push(`/document/${document.id}/${userId}`)
  }

  render() {
    // eslint-disable-next-line
    let document = this.props.documentStore.docInfos.find((doc) =>
      doc.id === this.props.match.params.documentId &&
      doc.userId === this.props.match.params.userId);
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
        onStartHighlighting={this.onStartHighlighting}
      />
    );
  }
}