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

let users = {
  selectByGoogleId:
  'SELECT * \
   FROM users \
   WHERE google_id = ?',
  selectById:
  'SELECT * \
   FROM users \
   WHERE id = ?',
  insert:
  'INSERT INTO users \
    VALUES (0, ?, ?, ?)',
  update:
  'UPDATE user \
   SET name = ?, email = ?, google_id = ? \
   WHERE id = ?'
}

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

let dbIniter = new DbIniter();
dbIniter.initDB();

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
  dbIniter.query(mysql.format(users.selectById, [obj]),
    (error, results, fields) => {
      if (error) {
        console.log(error);
        done(error);
        return;
      }
      console.log(`Deserialize user by user id, ${obj}`, results);
      return done(null, results[0]);
    });
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
    console.log('Access Token: ', accessToken)
    console.log('Refresh Token: ', refreshToken)
    process.nextTick(() => {
      // Check if user exists with google id
      dbIniter.query(mysql.format(users.selectByGoogleId, [profile.id]),
        (error, results, fields) => {
          if (error) {
            console.log(error);
            done(error);
            return;
          }
          console.log(`Get user by googleId ${profile.id}`, results);
          if (results.length) {
            return done(null, results[0]);
          } else {
            // Add new user to database
            dbIniter.query(mysql.format(users.insert,
              [
                profile.displayName,
                profile.emails.find((email) => email.type == 'account').value,
                profile.id,
              ]),
              (error, results, fields) => {
                if (error) {
                  console.log(error);
                  done(error);
                  return;
                }
                console.log(`Inserted user`, results);
                return done(null, {
                  id: results.insertId,
                  name: profile.displayName,
                  email: profile.emails.find((email) => email.type == 'account').value,
                  google_id: profile.id,
                });
              }
            )
          }
        }
      )
    })
  }
));



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
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
},
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read'],
    approvalPrompt: 'force'
  }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'back',
    failureRedirect: 'back',
  }));

app.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    //Inside a callback… bulletproof!
    res.sendStatus(200);
  });
})

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

app.post('/highlight', (req, res) => {
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

app.get('/documents/download/:id', (req, res) => {
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

app.post('/documents/update/:id', (req, res) => {
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

app.get('/documents/versions/:documentId', (req, res) => {
  console.log('----- VERSIONS ----')
  console.log('QUERY', mysql.format(documents.getVersions,[req.params.documentId]));
  console.log('--- DOIN\' IT ---')
  dbIniter.query(mysql.format(documents.getVersions,[req.params.documentId]),
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

app.get('/documents/:documentId/:userId', (req, res) => {
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

app.post('/documents/:documentId', (req, res) => {
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


app.post('/upload', upload.single('doc'), (req, res) => {
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

app.post('/visits/:documentId/:userId', (req, res) => {
  if (req.user) {
    console.log('PARAMS: ', req.params)
    console.log('BODY: ', req.body)
    console.log(mysql.format(visits.insert, [
      req.user.id,
      req.params.documentId,
      req.params.userId,
      new Date(),
      new Date(),
    ]));
    dbIniter.query(mysql.format(visits.insert, [
      req.user.id,
      req.params.documentId,
      req.params.userId,
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

app.get('/visits', (req, res) => {
  if (req.user) {
    dbIniter.query(mysql.format(visits.selectByUserId, [req.user.id]),
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

app.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json({});
  }
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