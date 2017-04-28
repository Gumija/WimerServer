
export default class DbInitializer {

  constructor(connection) {
    this.connection = connection;
  }
  initDB = () => {
    this.connection.connect();  
    this.initSchema();
  }

  initSchema = () => {
    this.query("CREATE DATABASE IF NOT EXISTS wimer");
    this.connection.changeUser({ database: 'wimer' }, (err) => {
      if (err) throw err;
      this.initTables();
    });
  }

  initTables = () => {
    console.log('Initing db.')
    this.query("\
      CREATE TABLE IF NOT EXISTS `documents` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `title` varchar(255) NOT NULL,\
      `path` varchar(512) NOT NULL,\
      `type` varchar(45) NOT NULL,\
      `encoding` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1",
      () => this.query("\
      CREATE TABLE IF NOT EXISTS `highlights` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `start` int(11) NOT NULL,\
      `end` int(11) NOT NULL,\
      `class` varchar(45) NOT NULL,\
      `container` varchar(45) NOT NULL,\
      `document_id` int(11) NOT NULL,\
      `user_id` int(11) NOT NULL,\
      PRIMARY KEY (`id`,`document_id`,`user_id`)\
    ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;",
        () => this.query("\
      CREATE TABLE IF NOT EXISTS `users` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `name` varchar(255) NOT NULL,\
      `email` varchar(255) NOT NULL,\
      `google_id` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
          () => {
            this.connection.end();
            console.log('Initiing finished!');
          }
        )));

  }

  query = (queryString, nextQuery) => {
    this.connection.query({ sql: queryString }, (error, results, fields) => {
      if (error) console.log(error);
      if (nextQuery) nextQuery();
    })
  }
}