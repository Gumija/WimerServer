

import express from 'express';
import dbIniter from './db/db';
import mysql from 'mysql';
import multer from 'multer';

let documents = {
  insert:
  'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?, ?)',
  selectAllByUser:
  'SELECT * \
   FROM documents \
   WHERE user_id = ?',
  selectByDocumentId:
  'SELECT * \
    FROM documents \
    WHERE id = ?',
  selectById:
  'SELECT * \
     FROM documents \
     WHERE id = ?\
     AND user_id = ?',
  update:
  'UPDATE documents \
     SET title = ? \
     WHERE id = ? \
     AND user_id = ?',
  getVersions:
  'SELECT d.id, d.user_id, d.title, u.name\
   FROM documents d\
   JOIN users u ON d.user_id = u.id\
   WHERE d.id = ?'
}

let router = express.Router();

let upload = multer({ dest: 'uploads/' });

router.get('/download/:id', (req, res) => {
  console.log(mysql.format(documents.selectByDocumentId, [req.params.id]));
  dbIniter.query(mysql.format(documents.selectByDocumentId, [req.params.id]),
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.download(results[0].path);
    }
  )
})

router.post('/update/:id', (req, res) => {
  if (req.user) {
    dbIniter.query(mysql.format(documents.update, [req.body.title, req.params.id, req.user.id]),
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
  } else {
    res.json([]);
  }
})

router.get('/versions/:documentId', (req, res) => {
  console.log('QUERY', mysql.format(documents.getVersions, [req.params.documentId]));
  dbIniter.query(mysql.format(documents.getVersions, [req.params.documentId]),
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

router.get('/:documentId/:userId', (req, res) => {
  dbIniter.query(mysql.format(documents.selectById,
    [
      parseInt(req.params.documentId, 10),
      parseInt(req.params.userId, 10)
    ]),
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

router.post('/:documentId', (req, res) => {
  if (req.user) {
    console.log('QUERY', mysql.format(documents.selectByDocumentId, [req.params.documentId]));
    dbIniter.query(mysql.format(documents.selectByDocumentId, [req.params.documentId]),
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        console.log(results);
        if (results.length) {
          dbIniter.query(mysql.format(documents.insert,
            [
              results[0].id,
              results[0].title,
              results[0].path,
              results[0].type,
              results[0].encoding,
              req.user.id,
            ]),
            (error, results, fields) => {
              if (error) {
                console.log(error);
                res.sendStatus(500);
                return;
              }
              console.log(results);
              res.json({ id: results.insertId });
            }
          )
        } else {
          res.sendStatus(500);
        }
      })
  } else {
    res.sendStatus(403) // 403 Forbidden
  }
})

router.get('/',
  (req, res) => {
    console.log('-------- DOCUMENTS --------');
    console.log('Session', req.session);
    console.log('SessionIdName: ', req.session.sessonIdName)
    console.log('SessionId: ', req.session.id)
    console.log('SessionId: ', req.sessionID)
    console.log('SessionCookie: ', req.session.cookie)
    console.log('Cookies: ', req.cookies)
    console.log('Signed Cookies: ', req.signedCookies)
    console.log('Auth: ', req.isAuthenticated());
    console.log('User: ', req.user);
    if (req.user) {
      dbIniter.query(mysql.format(documents.selectAllByUser, [req.user.id]),
        (error, results, field) => {
          if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
          }
          console.log(results);
          res.json(results);
        }
      )
    } else {
      res.json({});
    }
  })

router.post('/upload', upload.single('doc'), (req, res) => {
  if (req.user) {
    let file = req.file;
    // save document info to db
    dbIniter.query(mysql.format(documents.insert,
      [
        0,
        file.originalname,
        file.path,
        file.mimetype,
        file.encoding,
        req.user.id,
      ]),
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        console.log(results);
        res.json({ id: results.insertId });
      }
    )
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
})

export default router