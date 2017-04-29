import mysql from 'mysql';
export default class DbInitializer {

  constructor() {
    this.connection = null;
  }

  setupConnection = () => {
    if (this.connection == null) {
      let dbUrl = process.env.DATABASE_URL;
      console.log('DATABASE_URL', dbUrl);
      if (dbUrl) {
        this.connection = mysql.createConnection(dbUrl);
      } else {
        this.connection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'root',
          database: 'wimer'
        })
      }
    }
    this.connection.on('error', (err) => {
      console.log('Connection Error:' , err);
      this.connection = null;
      this.setupConnection();
    })
  }

  initDB = () => {
    this.setupConnection();
    this.initTables();
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
    this.queryWithConnection("\
      CREATE TABLE IF NOT EXISTS `documents` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `title` varchar(255) NOT NULL,\
      `path` varchar(512) NOT NULL,\
      `type` varchar(45) NOT NULL,\
      `encoding` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1",
      () => this.queryWithConnection("\
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
        () => this.queryWithConnection("\
      CREATE TABLE IF NOT EXISTS `users` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `name` varchar(255) NOT NULL,\
      `email` varchar(255) NOT NULL,\
      `google_id` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;",
          () => {
            // this.connection.end();
            console.log('Initiing finished!');
          }
        )));

  }

  queryWithConnection = (queryString, nextQuery) => {
    this.connection.query({ sql: queryString }, (error, results, fields) => {
      if (error) console.log(error);
      if (nextQuery) nextQuery();
    })
  }

  query = (queryString, callback) => {
    // this.connection.connect();
    this.connection.query({ sql: queryString }, (error, results, fields) => {
      callback(error, results, fields);
      // this.connection.end();
    });
  }


}