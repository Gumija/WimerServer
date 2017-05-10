import DocumentStore from '../stores/DocumentStore';
import proxy from '../proxy/DocumentProxy';

class DocumentService {
  getDocuments = async () => {
    let documentJson = await proxy.getDocuments();
    if (Object.keys(documentJson).length === 0 && documentJson.constructor === Object) {
      // empty response
    } else {
      for (let docinfo of documentJson) {
        DocumentStore.addDocumentInfo({
          id: docinfo.id,
          title: docinfo.title,
          preview: "",
          last_opened: new Date(),
          fileType: docinfo.type,
          userId: docinfo.user_id,
        })
      }
    }
  }

  getDocument = async (documentId, userId) => {
    let documentJson = await proxy.getDocument(documentId, userId);
    if (Object.keys(documentJson).length === 0 && documentJson.constructor === Object) {
      // empty response
    } else {
      for (let docinfo of documentJson) {
        DocumentStore.addDocumentInfo({
          id: docinfo.id,
          title: docinfo.title,
          preview: "",
          last_opened: new Date(),
          fileType: docinfo.type,
          userId: docinfo.user_id,
        })
      }
    }
  }

  getFile = async (document) => {
    let file = await proxy.getFile(document.id);
    return file;
  }

  updateTitle(document) {
    proxy.updateTitle(document.id, document.title);
  }

  addOwnDocument = async (documentId) => {
    await proxy.addOwnDocument(documentId);
  }

  visited = async (documentId, userId) => {
    await proxy.setVisited(documentId, userId);
    await this.getVisited();
  }

  getVisited = async () => {
    let json = await proxy.getVisited();
    if (Object.keys(json).length === 0 && json.constructor === Object) {
      // empty response
    } else {
      for (let recent of json) {
        DocumentStore.addRecentDocument({
          documentId: recent.document_id,
          userId: recent.document_user_id,
          date: recent.date,
          title: recent.title,
        })
      }
    }
  }

  getVersions = async (documentId) => {
    let json = await proxy.getVersions(documentId);
    if (Object.keys(json).length === 0 && json.constructor === Object) {
      // empty response
    } else {
      DocumentStore.clearVersions();
      for (let version of json) {
        DocumentStore.addVersion({
          id: version.id,
          userId: version.user_id,
          title: version.title,
          name: version.name,
        })
      }
    }
  }
}

var documentService = new DocumentService();
export default documentService;