import proxy from '../proxy/UserProxy';
import UserStore from '../stores/UserStore';

class UserService {

  getAndStoreCurrentUser = async (documentId) => {
    let jsonData = await proxy.getUser();
    console.log('User from server:', jsonData);
    UserStore.setCurrentUser(jsonData);
  }
}

var userService = new UserService();
export default userService;