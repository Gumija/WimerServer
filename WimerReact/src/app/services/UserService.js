import proxy from '../proxy/UserProxy';
import UserStore from '../stores/UserStore';

class UserService {

  getAndStoreCurrentUser = async (documentId) => {
    let jsonData = await proxy.getUser();
    console.log('User from server:', jsonData);
    if (!Array.isArray(jsonData)) {
      UserStore.setCurrentUser(jsonData);
    } else {
      UserStore.setCurrentUser(undefined);      
    }
  }
}

var userService = new UserService();
export default userService;