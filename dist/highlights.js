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

router.get('/:documentId/:userId', function (req, res) {
  _db2.default.query(_mysql2.default.format(highlights.selectByDocumentAndUser, [req.params.documentId, req.params.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

router.delete('/', function (req, res) {
  if (req.body.userId == req.user.id) {
    _db2.default.query(_mysql2.default.format(highlights.delete, [req.body.id, req.body.documentId, req.body.userId]), function (error, results, fields) {
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

router.post('/', function (req, res) {
  if (req.body.userId == req.user.id) {

    // save highlight from body
    _db2.default.query(_mysql2.default.format(highlights.insert, [req.body.id, req.body.start, req.body.end, req.body.class, req.body.container, req.body.documentId, req.body.userId]), function (error, results, fields) {
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