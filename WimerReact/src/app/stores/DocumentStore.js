import { observable, computed, action } from 'mobx';

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

  @computed get recentDocs() {
    return this.docInfos.sort((a, b) => a.last_opened > b.last_opened ? -1 : 1);
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