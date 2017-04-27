import LoremIpsum from './lorem_ipsum.txt';

class FileService {
  getFileFromUrl(url: string) {
    // let text = require('./lorem_ipsum.txt');
    let text = atob(LoremIpsum.substr(23))
    return text;
  }
}

var fileService = new FileService();
export default fileService;