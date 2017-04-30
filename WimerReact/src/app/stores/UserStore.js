import { observable, action } from 'mobx';

class UserStore {

  @observable currentUser = undefined;

  @action setCurrentUser(user){
    this.currentUser = user;
  }
}

var userStore = new UserStore();
export default userStore;