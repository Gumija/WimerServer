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

// add visit
router.post('/:documentId/:userId', function (req, res) {
  var userId = _hasher2.default.decode(req.params.userId);
  var documentId = _hasher2.default.decode(req.params.documentId);
  if (req.user && req.user.id == userId) {

    console.log('PARAMS: ', req.params);
    console.log('BODY: ', req.body);
    console.log(_mysql2.default.format(visits.insert, [req.user.id, documentId, userId, new Date(), new Date()]));
    _db2.default.query(_mysql2.default.format(visits.insert, [req.user.id, documentId, userId, new Date(), new Date()]), function (error, results, field) {
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

// get visits by user
router.get('/', function (req, res) {
  if (req.user) {
    _db2.default.query(_mysql2.default.format(visits.selectByUserId, [req.user.id]), function (error, results, field) {
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
          result.document_user_id = _hasher2.default.encode(result.document_user_id);
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
  } else {
    res.json({});
  }
});

exports.default = router;
//# sourceMappingURL=visits.js.map