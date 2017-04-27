import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import MariaSQLClient from 'mariasql';
import morgan from 'morgan';
import multer from 'multer';
import passport from 'passport';
import GoogleAuth from 'passport-google-oauth2';
import path from 'path';

let app = express();
let upload = multer({ dest: 'uploads/' });
let mariaDB = new MariaSQLClient({
  host: '127.0.0.1',
  user: 'root',
  password: '',
})

let documents = {
  insert: mariaDB.prepare(
    'INSERT INTO wimer.documents \
     VALUES (:id, :title, :path, :type, :encoding)'),
  selectAll: mariaDB.prepare(
    'SELECT * \
     FROM wimer.documents'
  ),
  selectById: mariaDB.prepare(
    'SELECT * \
     FROM wimer.documents \
     WHERE id = :id'
  ),
  update: mariaDB.prepare(
    'UPDATE wimer.documents \
     SET title = :title \
     WHERE id = :id'
  ),
}

let highlights = {
  insert: mariaDB.prepare(
    'INSERT INTO wimer.highlights \
     VALUES (:id, :start, :end, :class, :container, :documentId, :userId'
  ),
  delete: mariaDB.prepare(
    'DELETE FROM wimer.highlights \
     WHERE id = :id \
     AND document_id = :documentId \
     AND user_id = :userId'
  ),
  selectByDocumentAndUser: mariaDB.prepare(
    'SELECT * \
     FROM wimer.highlights \
     WHERE document_id = :documentId \
     AND user_id = :userId'
  )
}

// logger
// app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'wimer/build')));
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
app.use(bodyParser.json());

app.get('/highlight/:documentId/:userId', (req, res) => {
  mariaDB.query(highlights.selectByDocumentAndUser({
    documentId: req.params.documentId,
    userId: req.params.userId,
  }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.json(rows);
    }
  )
})

app.delete('/highlight', (req, res) => {
  mariaDB.query(highlights.delete({
    id: req.body.id,
    documentId: req.body.documentId,
    userId: req.body.userId,
  }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.sendStatus(200);
    }
  )
})

app.post('/highlight', (req, res) => {
  // save highlight from body
  mariaDB.query(highlights.insert({
    id: req.body.id,
    start: req.body.start,
    end: req.body.end,
    class: req.body.class,
    container: req.body.container,
    documentId: req.body.documentId,
    userId: req.body.userId,
  }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.sendStatus(200);
    }
  )
})

app.get('/documents/download/:id', (req, res) => {
  mariaDB.query(documents.selectById({ id: req.params.id }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.download(rows[0].path);
    }
  )
})

app.post('/documents/update/:id', (req, res) => {
  mariaDB.query(documents.update({ title: req.body.title, id: req.params.id }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.json(rows);
    }
  )
})

app.get('/documents/:id', (req, res) => {
  mariaDB.query(documents.selectById({ id: req.params.id }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.json(rows);
    }
  )
})

app.get('/documents', (req, res) => {
  mariaDB.query(documents.selectAll(),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.json(rows);
    }
  )
})

app.post('/upload', upload.single('doc'), (req, res) => {
  let file = req.file;
  // save document info to db
  mariaDB.query(documents.insert({
    id: 0,
    title: file.originalname,
    path: file.path,
    type: file.mimetype,
    encoding: file.encoding,
  }),
    (err, rows) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(rows);
      res.json({ id: rows.info.insertId });
    }
  )
})


// Serve static assets

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'wimer/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});