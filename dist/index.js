'use strict';

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mariasql = require('mariasql');

var _mariasql2 = _interopRequireDefault(_mariasql);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var upload = (0, _multer2.default)({ dest: 'uploads/' });
var mariaDB = new _mariasql2.default({
  host: '127.0.0.1',
  user: 'root',
  password: ''
});

var documents = {
  insert: mariaDB.prepare('INSERT INTO wimer.documents \
     VALUES (:id, :title, :path, :type, :encoding)'),
  selectAll: mariaDB.prepare('SELECT * \
     FROM wimer.documents'),
  selectById: mariaDB.prepare('SELECT * \
     FROM wimer.documents \
     WHERE id = :id'),
  update: mariaDB.prepare('UPDATE wimer.documents \
     SET title = :title \
     WHERE id = :id')
};

var highlights = {
  insert: mariaDB.prepare('INSERT INTO wimer.highlights \
     VALUES (:id, :start, :end, :class, :container, :documentId, :userId)'),
  delete: mariaDB.prepare('DELETE FROM wimer.highlights \
     WHERE id = :id \
     AND document_id = :documentId \
     AND user_id = :userId'),
  selectByDocumentAndUser: mariaDB.prepare('SELECT * \
     FROM wimer.highlights \
     WHERE document_id = :documentId \
     AND user_id = :userId')
};

// logger
app.use((0, _morgan2.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(_express2.default.static(_path2.default.resolve(__dirname, '..', 'WimerReact/build')));
app.use(_bodyParser2.default.json());

app.get('/highlight/:documentId/:userId', function (req, res) {
  mariaDB.query(highlights.selectByDocumentAndUser({
    documentId: req.params.documentId,
    userId: req.params.userId
  }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.json(rows);
  });
});

app.delete('/highlight', function (req, res) {
  mariaDB.query(highlights.delete({
    id: req.body.id,
    documentId: req.body.documentId,
    userId: req.body.userId
  }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.sendStatus(200);
  });
});

app.post('/highlight', function (req, res) {
  // save highlight from body
  mariaDB.query(highlights.insert({
    id: req.body.id,
    start: req.body.start,
    end: req.body.end,
    class: req.body.class,
    container: req.body.container,
    documentId: req.body.documentId,
    userId: req.body.userId
  }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.sendStatus(200);
  });
});

app.get('/documents/download/:id', function (req, res) {
  mariaDB.query(documents.selectById({ id: req.params.id }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.download(rows[0].path);
  });
});

app.post('/documents/update/:id', function (req, res) {
  mariaDB.query(documents.update({ title: req.body.title, id: req.params.id }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.json(rows);
  });
});

app.get('/documents/:id', function (req, res) {
  mariaDB.query(documents.selectById({ id: req.params.id }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.json(rows);
  });
});

app.get('/documents', function (req, res) {
  mariaDB.query(documents.selectAll(), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.json(rows);
  });
});

app.post('/upload', upload.single('doc'), function (req, res) {
  var file = req.file;
  // save document info to db
  mariaDB.query(documents.insert({
    id: 0,
    title: file.originalname,
    path: file.path,
    type: file.mimetype,
    encoding: file.encoding
  }), function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    console.log(rows);
    res.json({ id: rows.info.insertId });
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