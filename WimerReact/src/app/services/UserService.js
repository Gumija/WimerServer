import proxy from '../proxy/UserProxy';
import UserStore from '../stores/UserStore';

class UserService {

  getAndStoreCurrentUser = async (documentId) => {
    let jsonData = await proxy.getUser();
    for (let user of jsonData) {
      UserStore.setCurrentUser(user);
    }
  }
}

var userService = new UserService();
export default userService;