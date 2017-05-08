'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DbInitializer = function DbInitializer() {
  var _this = this;

  _classCallCheck(this, DbInitializer);

  this.setupConnection = function () {
    if (_this.connection == null) {
      var dbUrl = process.env.DATABASE_URL;
      console.log('DATABASE_URL', dbUrl);
      if (dbUrl) {
        _this.connection = _mysql2.default.createConnection(dbUrl);
      } else {
        _this.connection = _mysql2.default.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'root',
          database: 'wimer'
        });
      }
    }
    _this.connection.on('error', function (err) {
      console.log('Connection Error:', err);
      _this.connection = null;
      _this.setupConnection();
    });
  };

  this.initDB = function () {
    _this.setupConnection();
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
    _this.queryWithConnection("\
      CREATE TABLE IF NOT EXISTS `documents` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `title` varchar(255) NOT NULL,\
      `path` varchar(512) NOT NULL,\
      `type` varchar(45) NOT NULL,\
      `encoding` varchar(45) NOT NULL,\
      `user_id` int(11) NOT NULL,\
      PRIMARY KEY (`id`, `user_id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1", function () {
      return _this.queryWithConnection("\
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
        return _this.queryWithConnection("\
      CREATE TABLE IF NOT EXISTS `users` (\
      `id` int(11) NOT NULL AUTO_INCREMENT,\
      `name` varchar(255) NOT NULL,\
      `email` varchar(255) NOT NULL,\
      `google_id` varchar(45) NOT NULL,\
      PRIMARY KEY (`id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;", function () {
          return _this.queryWithConnection("\
      CREATE TABLE IF NOT EXISTS `visits` (\
      `user_id` INT NOT NULL,\
      `document_id` INT NOT NULL,\
      `document_user_id` INT NOT NULL,\
      `date` DATETIME NOT NULL,\
      PRIMARY KEY (`user_id`, `document_id`, `document_user_id`)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;", function () {
            // this.connection.end();
            console.log('Initiing finished!');
          });
        });
      });
    });
  };

  this.queryWithConnection = function (queryString, nextQuery) {
    _this.connection.query({ sql: queryString }, function (error, results, fields) {
      if (error) console.log(error);
      if (nextQuery) nextQuery();
    });
  };

  this.query = function (queryString, callback) {
    // this.connection.connect();
    _this.connection.query({ sql: queryString }, function (error, results, fields) {
      callback(error, results, fields);
      // this.connection.end();
    });
  };

  this.connection = null;
};

var dbIniter = new DbInitializer();
exports.default = dbIniter;
//# sourceMappingURL=db.js.map