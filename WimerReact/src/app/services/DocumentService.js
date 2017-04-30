import DocumentStore from '../stores/DocumentStore';
import proxy from '../proxy/DocumentProxy';

class DocumentService {
  getDocuments = async () => {
    let documentJson = await proxy.getDocuments();
    for (let docinfo of documentJson) {
      DocumentStore.addDocumentInfo({
        id: parseInt(docinfo.id, 10),
        title: docinfo.title,
        preview: "",
        last_opened: new Date(),
        fileType: docinfo.type,
      })
    }
  }

  getDocument = async (documentId, userId) => {
    let documentJson = await proxy.getDocument(documentId, userId);
    for (let docinfo of documentJson) {
      DocumentStore.addDocumentInfo({
        id: parseInt(docinfo.id, 10),
        title: docinfo.title,
        preview: "",
        last_opened: new Date(),
        fileType: docinfo.type,
      })
    }
  }

  getFile = async (document) => {
    let file = await proxy.getFile(document.id);
    return file;
  }

  updateTitle(document) {
    proxy.updateTitle(document.id, document.title);
  }
}

var documentService = new DocumentService();
export default documentService;