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
    let documentId = parseInt(this.props.match.params.documentId, 10);
    let userId = parseInt(this.props.match.params.userId, 10);
    let nextdocumentId = parseInt(nextProps.match.params.documentId, 10);
    let nextUserId = parseInt(nextProps.match.params.userId, 10);
    if (documentId !== nextdocumentId || userId !== nextUserId) {
      this.init(nextProps);
    }
  }

  init = async (props) => {
    let documentId = parseInt(props.match.params.documentId, 10);
    let userId = parseInt(props.match.params.userId, 10);
    await DocumentService.getDocument(documentId, userId);
    let document = props.documentStore.docInfos.find((doc) => doc.id === documentId);
    this.props.documentStore.setCurrentFile({ id: document.id, file: await DocumentService.getFile(document) })
    this.props.documentStore.setHighlights({ id: documentId, str: await HighlightService.getHighlights(documentId, userId) });
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
      doc.id === parseInt(this.props.match.params.documentId, 10) &&
      doc.userId === parseInt(this.props.match.params.userId, 10));
    DocumentService.addOwnDocument(document.id);
    let userId = this.props.userStore.currentUser.id;
    this.props.history.push(`/document/${document.id}/${userId}`)
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
        onStartHighlighting={this.onStartHighlighting}
      />
    );
  }
}