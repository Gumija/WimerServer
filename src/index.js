import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import mysql from 'mysql';
import multer from 'multer';
import passport from 'passport';
import GoogleAuth from 'passport-google-oauth';
import path from 'path';
import DbIniter from './db/db';

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  , GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  console.log('Serialize:', user.id)
  done(null, user.id);
});

passport.deserializeUser(function (obj, done) {
  console.log('Deserialize:', obj)
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleAuth.OAuth2Strategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://morning-stream-82096.herokuapp.com/auth/google/callback",
  passReqToCallback: true
},
  (request, accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    })
  }
));

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

let app = express();
let upload = multer({ dest: 'uploads/' });

let buildFolderPath = process.env.DATABASE_URL ? path.resolve(__dirname, './', 'WimerReact/build')
  : path.resolve(__dirname, '..', 'WimerReact/build')
// logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(express.static(buildFolderPath));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'cookie_secret',
}));
app.use(passport.initialize());
app.use(passport.session());

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

//   app.get('/auth/google/callback', function(req, res, next) {
//   passport.authenticate('google', function(err, user, info) {
//     console.log('User', user);
//     console.log('Info:', info);
//     if (err) { console.log(err); return next(err); }
//     if (!user) { console.log('No user'); return res.redirect('/'); }
//     req.login(user, function(err) {
//       if (err) { console.log(err); return next(err); }
//       return res.redirect('/');
//     });
//   })(req, res, next);
// });




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

app.get('/documents',
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
  if (process.env.DATABASE_URL) {
    res.sendFile(path.resolve(buildFolderPath, 'index.html'));
  } else {
    res.sendFile(path.resolve(buildFolderPath, 'index.html'));
  }
});

app.set('port', (process.env.PORT || 3001));

app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get("port")}!`);
});