
import express from 'express';
import dbIniter from './db/db';
import mysql from 'mysql';
import hasher from './hasher';

let visits = {
  insert:
  'INSERT INTO visits \
   VALUES (?, ?, ?, ?) \
   ON DUPLICATE KEY UPDATE date = ?',
  selectByUserId:
  'SELECT v.document_id, v.document_user_id, v.date , d.title \
   FROM visits v\
   JOIN documents d ON v.document_id = d.id \
										AND v.document_user_id = d.user_id\
   WHERE v.user_id = ? \
   ORDER BY v.date DESC;'
}

let router = express.Router();

// add visit
router.post('/:documentId/:userId', (req, res) => {
  let userId = hasher.decode(req.params.userId);
  let documentId = hasher.decode(req.params.documentId);
  if (req.user && req.user.id == userId) {

    console.log('PARAMS: ', req.params)
    console.log('BODY: ', req.body)
    console.log(mysql.format(visits.insert, [
      req.user.id,
      documentId,
      userId,
      new Date(),
      new Date(),
    ]));
    dbIniter.query(mysql.format(visits.insert, [
      req.user.id,
      documentId,
      userId,
      new Date(),
      new Date(),
    ]),
      (error, results, field) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        console.log(results);
        res.sendStatus(200);
      }
    )
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
})

// get visits by user
router.get('/', (req, res) => {
  if (req.user) {
    dbIniter.query(mysql.format(visits.selectByUserId, [req.user.id]),
      (error, results, field) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        console.log(results);
        for(let result of results) {
          result.document_id = hasher.encode(result.document_id);
          result.document_user_id = hasher.encode(result.document_user_id);
        }
        res.json(results);
      }
    )
  } else {
    res.json({});
  }
})

export default router;