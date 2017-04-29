import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import mysql from 'mysql';
import multer from 'multer';
import passport from 'passport';
import GoogleAuth from 'passport-google-oauth2';
import path from 'path';
import DbIniter from './db/db';

let app = express();
let upload = multer({ dest: 'uploads/' });


let dbIniter = new DbIniter();
dbIniter.initDB();

let documents = {
  insert:
  'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?)',
  selectAll:
  'SELECT * \
     FROM documents',
  selectById:
  'SELECT * \
     FROM documents \
     WHERE id = ?',
  update:
  'UPDATE documents \
     SET title = ? \
     WHERE id = ?',
}

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


let buildFolderPath = process.env.DATABASE_URL ? path.resolve(__dirname, './', 'WimerReact/build')
  : path.resolve(__dirname, '..', 'WimerReact/build')
// logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(express.static(buildFolderPath));
app.use(bodyParser.json());

app.get('/highlight/:documentId/:userId', (req, res) => {
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

app.delete('/highlight', (req, res) => {
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
})

app.post('/highlight', (req, res) => {
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
})

app.get('/documents/download/:id', (req, res) => {
  console.log(mysql.format(documents.selectById, [req.params.id]));
  dbIniter.query(mysql.format(documents.selectById, [req.params.id]),
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

app.post('/documents/update/:id', (req, res) => {
  dbIniter.query(mysql.format(documents.update, [req.body.title, req.params.id]),
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

app.get('/documents/:id', (req, res) => {
  dbIniter.query(mysql.format(documents.selectById, [parseInt(req.params.id, 10)]),
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

app.get('/documents', (req, res) => {
  dbIniter.query(documents.selectAll,
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
})

app.post('/upload', upload.single('doc'), (req, res) => {
  let file = req.file;
  // save document info to db
  dbIniter.query(mysql.format(documents.insert,
    [
      0,
      file.originalname,
      file.path,
      file.mimetype,
      file.encoding,
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
})


// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  console.log("dirname:", __dirname)
  console.log('--------- INDEX.HTML path:', path.resolve(__dirname, '..', 'WimerReact/build', 'index.html'));
  console.log('--------- INDEX.HTML path:', path.resolve(__dirname, './', 'WimerReact/build', 'index.html'));
  if (dbUrl) {
    res.sendFile(path.resolve(buildFolderPath, 'index.html'));
  } else {
    res.sendFile(path.resolve(buildFolderPath, 'index.html'));
  }
});

app.set('port', (process.env.PORT || 3001));

app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get("port")}!`);
});