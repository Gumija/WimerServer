

class HighlightProxy {
  addHighlight = async (hl) => {
    await fetch('/highlight', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(hl),
    })
  }

  removeHighlight = async (hl) => {
    await fetch('/highlight', {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(hl),
    })
  }

  getHighlights = async (documentId, userId) => {
    let res = await fetch(`/highlight/${documentId}/${userId}`,{
      credentials: 'include'
    })
    return await res.json();
  }
}

var highlightProxy = new HighlightProxy();
export default highlightProxy;