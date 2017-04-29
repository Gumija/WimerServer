
class DocumentProxy {
  getDocuments = async () => {
    let res = await fetch('/documents',{
      credentials: 'include'
    });
    return await res.json();
  }

  getDocument = async (id) => {
    let res = await fetch(`/documents/${id}`,{
      credentials: 'include'
    });
    return await res.json();
  }

  getFile = async (id) => {
    let res = await fetch(`/documents/download/${id}`,{
      credentials: 'include'
    });
    return await res.text();
  }

  updateTitle = async (id, title) => {
    fetch(`/documents/update/${id}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({ title: title }),
    })
  }
}

var documentProxy = new DocumentProxy();
export default documentProxy;