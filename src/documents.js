
import express from 'express';
import dbIniter from './db/db';
import mysql from 'mysql';
import multer from 'multer';
import hasher from './hasher';

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

// download file
router.get('/download/:id', (req, res) => {
  let id = hasher.decode(req.params.id);

  console.log(mysql.format(documents.selectByDocumentId, [id]));
  dbIniter.query(mysql.format(documents.selectByDocumentId, [id]),
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

// update title
router.post('/update/:id', (req, res) => {
  if (req.user) {
    let id = hasher.decode(req.params.id);
    dbIniter.query(mysql.format(documents.update, [req.body.title, id, req.user.id]),
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
    res.json([]);
  }
})


// get versions
router.get('/versions/:documentId', (req, res) => {
  let documentId = hasher.decode(req.params.documentId);
  console.log('QUERY', mysql.format(documents.getVersions, [documentId]));
  dbIniter.query(mysql.format(documents.getVersions, [documentId]),
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      for (let result of results) {
        result.id = hasher.encode(result.id);
        result.user_id = hasher.encode(result.user_id);
      }
      res.json(results);
    }
  )
})

// get document information
router.get('/:documentId/:userId', (req, res) => {
  let documentId = hasher.decode(req.params.documentId);
  let userId = hasher.decode(req.params.userId);
  dbIniter.query(mysql.format(documents.selectById,
    [
      parseInt(documentId, 10),
      parseInt(userId, 10)
    ]),
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      for (let result of results) {
        result.id = hasher.encode(result.id);
        result.user_id = hasher.encode(result.user_id);
      }
      res.json(results);
    }
  )
})

// upload document
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
        res.json({
          id: hasher.encode(results.insertId),
          userId: hasher.encode(req.user.id),
        });
      }
    )
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
})

// save document information
router.post('/:documentId', (req, res) => {
  if (req.user) {
    let documentId = hasher.decode(req.params.documentId);
    console.log('QUERY', mysql.format(documents.selectByDocumentId, [documentId]));
    dbIniter.query(mysql.format(documents.selectByDocumentId, [documentId]),
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
              res.json({
                id: hasher.encode(results.insertId),
                userId: hasher.encode(req.user.id),
              });
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

export default router