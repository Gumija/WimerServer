'use strict';

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportGoogleOauth = require('passport-google-oauth2');

var _passportGoogleOauth2 = _interopRequireDefault(_passportGoogleOauth);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _db = require('./db/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var upload = (0, _multer2.default)({ dest: 'uploads/' });

var dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL', dbUrl);
var connection = void 0;
if (dbUrl) {
  connection = _mysql2.default.createConnection(dbUrl);
} else {
  connection = _mysql2.default.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'wimer'
  });
}
var dbIniter = new _db2.default(connection);
dbIniter.initDB();

var documents = {
  insert: 'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?)',
  selectAll: 'SELECT * \
     FROM documents',
  selectById: 'SELECT * \
     FROM documents \
     WHERE id = ?',
  update: 'UPDATE documents \
     SET title = ? \
     WHERE id = ?'
};

var highlights = {
  insert: 'INSERT INTO highlights \
     VALUES (?, ?, ?, ?, ?, ?, ?)',
  delete: 'DELETE FROM highlights \
     WHERE id = ? \
     AND document_id = ? \
     AND user_id = ?',
  selectByDocumentAndUser: 'SELECT * \
     FROM highlights \
     WHERE document_id = ? \
     AND user_id = ?'
};

// logger
app.use((0, _morgan2.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(_express2.default.static(_path2.default.resolve(__dirname, '..', 'WimerReact/build')));
app.use(_bodyParser2.default.json());

app.get('/highlight/:documentId/:userId', function (req, res) {
  connection.query(_mysql2.default.format(highlights.selectByDocumentAndUser, [req.params.documentId, req.params.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.delete('/highlight', function (req, res) {
  connection.query(_mysql2.default.format(highlights.delete, [req.body.id, req.body.documentId, req.body.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(fields);
    res.sendStatus(200);
  });
});

app.post('/highlight', function (req, res) {
  // save highlight from body
  connection.query(_mysql2.default.format(highlights.insert, [req.body.id, req.body.start, req.body.end, req.body.class, req.body.container, req.body.documentId, req.body.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.sendStatus(200);
  });
});

app.get('/documents/download/:id', function (req, res) {
  console.log(_mysql2.default.format(documents.selectById, [req.params.id]));
  connection.query(_mysql2.default.format(documents.selectById, [req.params.id]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.download(results[0].path);
  });
});

app.post('/documents/update/:id', function (req, res) {
  connection.query(_mysql2.default.format(documents.update, [req.body.title, req.params.id]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/documents/:id', function (req, res) {
  connection.query(_mysql2.default.format(documents.selectById, [parseInt(req.params.id, 10)]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/documents', function (req, res) {
  connection.query(documents.selectAll, function (error, results, field) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.post('/upload', upload.single('doc'), function (req, res) {
  var file = req.file;
  // save document info to db
  connection.query(_mysql2.default.format(documents.insert, [0, file.originalname, file.path, file.mimetype, file.encoding]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json({ id: results.insertId });
  });
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', function (req, res) {
  res.sendFile(_path2.default.resolve(__dirname, '..', 'WimerReact/build', 'index.html'));
});

app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get("port") + '!');
});
//# sourceMappingURL=index.js.map