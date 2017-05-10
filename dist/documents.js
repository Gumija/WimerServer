'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _db = require('./db/db');

var _db2 = _interopRequireDefault(_db);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _hasher = require('./hasher');

var _hasher2 = _interopRequireDefault(_hasher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var documents = {
  insert: 'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?, ?)',
  selectAllByUser: 'SELECT * \
   FROM documents \
   WHERE user_id = ?',
  selectByDocumentId: 'SELECT * \
    FROM documents \
    WHERE id = ?',
  selectById: 'SELECT * \
     FROM documents \
     WHERE id = ?\
     AND user_id = ?',
  update: 'UPDATE documents \
     SET title = ? \
     WHERE id = ? \
     AND user_id = ?',
  getVersions: 'SELECT d.id, d.user_id, d.title, u.name\
   FROM documents d\
   JOIN users u ON d.user_id = u.id\
   WHERE d.id = ?'
};

var router = _express2.default.Router();

var upload = (0, _multer2.default)({ dest: 'uploads/' });

// download file
router.get('/download/:id', function (req, res) {
  var id = _hasher2.default.decode(req.params.id);

  console.log(_mysql2.default.format(documents.selectByDocumentId, [id]));
  _db2.default.query(_mysql2.default.format(documents.selectByDocumentId, [id]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.download(results[0].path);
  });
});

// update title
router.post('/update/:id', function (req, res) {
  if (req.user) {
    var id = _hasher2.default.decode(req.params.id);
    _db2.default.query(_mysql2.default.format(documents.update, [req.body.title, id, req.user.id]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.sendStatus(200);
    });
  } else {
    res.json([]);
  }
});

// get versions
router.get('/versions/:documentId', function (req, res) {
  var documentId = _hasher2.default.decode(req.params.documentId);
  console.log('QUERY', _mysql2.default.format(documents.getVersions, [documentId]));
  _db2.default.query(_mysql2.default.format(documents.getVersions, [documentId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = results[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var result = _step.value;

        result.id = _hasher2.default.encode(result.id);
        result.user_id = _hasher2.default.encode(result.user_id);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    res.json(results);
  });
});

// get document information
router.get('/:documentId/:userId', function (req, res) {
  var documentId = _hasher2.default.decode(req.params.documentId);
  var userId = _hasher2.default.decode(req.params.userId);
  _db2.default.query(_mysql2.default.format(documents.selectById, [parseInt(documentId, 10), parseInt(userId, 10)]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = results[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var result = _step2.value;

        result.id = _hasher2.default.encode(result.id);
        result.user_id = _hasher2.default.encode(result.user_id);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    res.json(results);
  });
});

// upload document
router.post('/upload', upload.single('doc'), function (req, res) {
  if (req.user) {
    var file = req.file;
    // save document info to db
    _db2.default.query(_mysql2.default.format(documents.insert, [0, file.originalname, file.path, file.mimetype, file.encoding, req.user.id]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json({
        id: _hasher2.default.encode(results.insertId),
        userId: _hasher2.default.encode(req.user.id)
      });
    });
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
});

// save document information
router.post('/:documentId', function (req, res) {
  if (req.user) {
    var documentId = _hasher2.default.decode(req.params.documentId);
    console.log('QUERY', _mysql2.default.format(documents.selectByDocumentId, [documentId]));
    _db2.default.query(_mysql2.default.format(documents.selectByDocumentId, [documentId]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      if (results.length) {
        _db2.default.query(_mysql2.default.format(documents.insert, [results[0].id, results[0].title, results[0].path, results[0].type, results[0].encoding, req.user.id]), function (error, results, fields) {
          if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
          }
          console.log(results);
          res.json({
            id: _hasher2.default.encode(results.insertId),
            userId: _hasher2.default.encode(req.user.id)
          });
        });
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
});

router.get('/', function (req, res) {
  console.log('-------- DOCUMENTS --------');
  console.log('Session', req.session);
  console.log('SessionIdName: ', req.session.sessonIdName);
  console.log('SessionId: ', req.session.id);
  console.log('SessionId: ', req.sessionID);
  console.log('SessionCookie: ', req.session.cookie);
  console.log('Cookies: ', req.cookies);
  console.log('Signed Cookies: ', req.signedCookies);
  console.log('Auth: ', req.isAuthenticated());
  console.log('User: ', req.user);
  if (req.user) {
    _db2.default.query(_mysql2.default.format(documents.selectAllByUser, [req.user.id]), function (error, results, field) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json(results);
    });
  } else {
    res.json({});
  }
});

exports.default = router;
//# sourceMappingURL=documents.js.map