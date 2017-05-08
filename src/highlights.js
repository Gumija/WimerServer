
import express from 'express';
import dbIniter from './db/db';
import mysql from 'mysql';

let highlights = {
  insert:
  'INSERT INTO highlights \
     VALUES (?, ?, ?, ?, ?, ?, ?)',
  delete:
  'DELETE FROM highlights \
     WHERE id = ? \
     AND document_id = ? \
     AND user_id = ?',
  selectByDocumentAndUser:
  'SELECT * \
     FROM highlights \
     WHERE document_id = ? \
     AND user_id = ?',
}

let router = express.Router();

// get highlights by document and user
router.get('/:documentId/:userId', (req, res) => {
  dbIniter.query(mysql.format(highlights.selectByDocumentAndUser,
    [
      req.params.documentId,
      req.params.userId,
    ]
  ),
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json(results);
    }
  )
})

// delete highlight
router.delete('/', (req, res) => {
  if (req.body.userId == req.user.id) {
    dbIniter.query(mysql.format(highlights.delete,
      [
        req.body.id,
        req.body.documentId,
        req.body.userId,
      ]
    ),
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        console.log(fields);
        res.sendStatus(200);
      }
    )
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
})

// add highlights
router.post('/', (req, res) => {
  if (req.body.userId == req.user.id) {

    // save highlight from body
    dbIniter.query(mysql.format(highlights.insert,
      [
        req.body.id,
        req.body.start,
        req.body.end,
        req.body.class,
        req.body.container,
        req.body.documentId,
        req.body.userId,
      ]
    ),
      (error, results, fields) => {
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

export default router;