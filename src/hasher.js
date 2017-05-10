import Hashids from 'hashids';

var hasher = new Hashids("Wimer Project Salt", 10);

export default hasher;