import { observable } from 'mobx';

class DocumentStore {

  @observable currentUser = {
    id: 0,
    name: 'Gulyas Milan',
    email: 'gumija@gmail.com',
    googleId: '1234567890',
  }

}

var documentStore = new DocumentStore();
export default documentStore;