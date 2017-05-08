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

var visits = {
  insert: 'INSERT INTO visits \
   VALUES (?, ?, ?, ?) \
   ON DUPLICATE KEY UPDATE date = ?',
  selectByUserId: 'SELECT v.document_id, v.document_user_id, v.date , d.title \
   FROM visits v\
   JOIN documents d ON v.document_id = d.id \
										AND v.document_user_id = d.user_id\
   WHERE v.user_id = ? \
   ORDER BY v.date DESC;'
};

var router = _express2.default.Router();

router.post('/:documentId/:userId', function (req, res) {
  if (req.user) {
    console.log('PARAMS: ', req.params);
    console.log('BODY: ', req.body);
    console.log(_mysql2.default.format(visits.insert, [req.user.id, req.params.documentId, req.params.userId, new Date(), new Date()]));
    _db2.default.query(_mysql2.default.format(visits.insert, [req.user.id, req.params.documentId, req.params.userId, new Date(), new Date()]), function (error, results, field) {
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

router.get('/', function (req, res) {
  if (req.user) {
    _db2.default.query(_mysql2.default.format(visits.selectByUserId, [req.user.id]), function (error, results, field) {
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
//# sourceMappingURL=visits.js.map