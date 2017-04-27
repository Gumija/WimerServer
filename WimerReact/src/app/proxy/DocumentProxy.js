
class DocumentProxy {
  getDocuments = async () => {
    let res = await fetch('/documents');
    return await res.json();
  }

  getDocument = async (id) => {
    let res = await fetch(`/documents/${id}`);
    return await res.json();
  }

  getFile = async (id) => {
    let res = await fetch(`/documents/download/${id}`);
    return await res.text();
  }

  updateTitle = async (id, title) => {
    fetch(`/documents/update/${id}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: title }),
    })
  }
}

var documentProxy = new DocumentProxy();
export default documentProxy;