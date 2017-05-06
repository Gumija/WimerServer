
class DocumentProxy {
  getDocuments = async () => {
    let res = await fetch('/documents',{
      credentials: 'include'
    });
    return await res.json();
  }

  getDocument = async (documentId, userId) => {
    let res = await fetch(`/documents/${documentId}/${userId}`,{
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

  addOwnDocument = async (documentId) => {
    await fetch(`/documents/${documentId}`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  setVisited = (documentId, userId) => {
    fetch(`/visits/${documentId}/${userId}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        documentId: documentId,
        userId: userId,
      })
    })
  }

  getVisited = async() => {
    let res = await fetch('/visits');
    let json =  await res.json();
    console.log('Visited json: ', json);
    return json;
  }
}

var documentProxy = new DocumentProxy();
export default documentProxy;