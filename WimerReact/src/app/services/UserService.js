import proxy from '../proxy/UserProxy';
import UserStore from '../stores/UserStore';

class UserService {

  getAndStoreCurrentUser = async (documentId) => {
    let jsonData = await proxy.getUser();
    console.log('User from server:', jsonData);
    if (Object.keys(jsonData).length === 0 && jsonData.constructor === Object) {
      UserStore.setCurrentUser(undefined);
    } else {
      UserStore.setCurrentUser(jsonData);
    }
  }
}

var userService = new UserService();
export default userService;