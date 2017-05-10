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

var _hasher = require('./hasher');

var _hasher2 = _interopRequireDefault(_hasher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var router = _express2.default.Router();

// get highlights by document and user
router.get('/:documentId/:userId', function (req, res) {
  var userId = _hasher2.default.decode(req.params.userId);
  var documentId = _hasher2.default.decode(req.params.documentId);
  _db2.default.query(_mysql2.default.format(highlights.selectByDocumentAndUser, [documentId, userId]), function (error, results, fields) {
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

        result.document_id = _hasher2.default.encode(result.document_id);
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

// delete highlight
router.delete('/', function (req, res) {
  var userId = _hasher2.default.decode(req.body.userId);
  var documentId = _hasher2.default.decode(req.body.documentId);
  if (userId == req.user.id) {
    _db2.default.query(_mysql2.default.format(highlights.delete, [req.body.id, documentId, userId]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(fields);
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
});

// add highlights
router.post('/', function (req, res) {
  var userId = _hasher2.default.decode(req.body.userId);
  var documentId = _hasher2.default.decode(req.body.documentId);
  if (userId == req.user.id) {

    // save highlight from body
    _db2.default.query(_mysql2.default.format(highlights.insert, [req.body.id, req.body.start, req.body.end, req.body.class, req.body.container, documentId, userId]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
});

exports.default = router;
//# sourceMappingURL=highlights.js.map