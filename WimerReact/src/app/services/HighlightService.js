import proxy from '../proxy/HighlightProxy';
import DocumentStore from '../stores/DocumentStore';
import UserStore from '../stores/UserStore';

class HighlightService {
  addHighlight = (hl) => {
    proxy.addHighlight({
      id: hl.id,
      start: hl.characterRange.start,
      end: hl.characterRange.end,
      class: hl.classApplier.className,
      container: hl.containerElementId,
      documentId: DocumentStore.currentFile.id,
      userId: UserStore.currentUser.id,
    })
  }

  removeHighlight = (hl) => {
    proxy.removeHighlight({
      id: hl.id,
      documentId: DocumentStore.currentFile.id,
      userId: UserStore.currentUser.id,
    })
  }

  getHighlights = async (documentId, userId) => {
    let jsonData = await proxy.getHighlights(documentId, userId);
    let str = 'type:textContent';
    if (Object.keys(jsonData).length === 0 && jsonData.constructor === Object) {
      // empty response
      return str;
    } else {
      // type:textContent|0$4$1$rgba(256,0,0,0.6)$presenter
      for (let hl of jsonData) {
        str += '|' + hl.start + '$' + hl.end + '$' + hl.id + '$' + hl.class + '$' + hl.container;
      }
      return str;
    }
  }
}

var highlightService = new HighlightService();
export default highlightService;