'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DbInitializer = function DbInitializer(connection) {
  var _this = this;

  _classCallCheck(this, DbInitializer);

  this.initDB = function () {
    _this.connection.connect();
    _this.initTables();
  };

  this.initSchema = function () {
    _this.query("CREATE DATABASE IF NOT EXISTS wimer");
    _this.connection.changeUser({ database: 'wimer' }, function (err) {
      if (err) throw err;
      _this.initTables();
    });
  };

  this.initTables = function () {
    console.log('Initing db.');
    _this.query("\
      CREATE TABLE IF NOT EXISTS `documents` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `title` varchar(255) NOT NULL,\
      `path` varchar(512) NOT NULL,\
      `type` varchar(45) NOT NULL,\
      `encoding` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1", function () {
      return _this.query("\
      CREATE TABLE IF NOT EXISTS `highlights` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `start` int(11) NOT NULL,\
      `end` int(11) NOT NULL,\
      `class` varchar(45) NOT NULL,\
      `container` varchar(45) NOT NULL,\
      `document_id` int(11) NOT NULL,\
      `user_id` int(11) NOT NULL,\
      PRIMARY KEY (`id`,`document_id`,`user_id`)\
    ) ENGINE=InnoDB  DEFAULT CHARSET=latin1;", function () {
        return _this.query("\
      CREATE TABLE IF NOT EXISTS `users` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `name` varchar(255) NOT NULL,\
      `email` varchar(255) NOT NULL,\
      `google_id` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;", function () {
          _this.connection.end();
          console.log('Initiing finished!');
        });
      });
    });
  };

  this.query = function (queryString, nextQuery) {
    _this.connection.query({ sql: queryString }, function (error, results, fields) {
      if (error) console.log(error);
      if (nextQuery) nextQuery();
    });
  };

  this.connection = connection;
};

exports.default = DbInitializer;
//# sourceMappingURL=db.js.map