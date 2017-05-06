import { observable, action } from 'mobx';

class DocumentStore {

  @observable docInfos = []

  @observable currentFile = {
    id: -1,
    file: '',
  };

  @observable highlightsString = {
    id: -1,
    str: '',
  }

  @observable recentDocs = []

  @action addRecentDocument(recentDoc){
    let doc = this.recentDocs.find(doc => doc.documentId === recentDoc.documentId && doc.userId === recentDoc.userId)
    if (doc) {
      this.recentDocs.splice(this.recentDocs.indexOf(doc), 1);
    }
    this.recentDocs.push(recentDoc);
  }

  @action resetStore() {
    this.docInfos = [];
    this.currentFile = {
      id: -1,
      file: '',
    }
    this.highlightsString = {
      id: -1,
      str: '',
    }
  }

  @action addDocumentInfo(docinfo) {
    let doc = this.docInfos.find(doc => doc.id === docinfo.id)
    if (doc) {
      this.docInfos.splice(this.docInfos.indexOf(doc), 1);
    }
    this.docInfos.push(docinfo);
  }

  @action setCurrentFile(value) {
    this.currentFile = value;
  }

  @action setHighlights(value) {
    this.highlightsString = value;
  }

}

var documentStore = new DocumentStore();
export default documentStore;