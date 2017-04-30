

class UserProxy {
  getUser = async () => {
    let res = await fetch('/user', {
      credentials: 'include',
    })
    return await res.json();
  }
}

var userProxy = new UserProxy();
export default userProxy;