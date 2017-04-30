'use strict';

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportGoogleOauth = require('passport-google-oauth');

var _passportGoogleOauth2 = _interopRequireDefault(_passportGoogleOauth);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _db = require('./db/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var documents = {
  insert: 'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?, ?)',
  selectAllByUser: 'SELECT * \
   FROM documents \
   WHERE user_id = ?',
  selectById: 'SELECT * \
     FROM documents \
     WHERE id = ?',
  update: 'UPDATE documents \
     SET title = ? \
     WHERE id = ? \
     AND user_id = ?'
};

var highlights = {
  insert: 'INSERT INTO highlights \
     VALUES (?, ?, ?, ?, ?, ?, ?)',
  delete: 'DELETE FROM highlights \
     WHERE id = ? \
     AND document_id = ? \
     AND user_id = ?',
  selectByDocumentAndUser: 'SELECT * \
     FROM highlights \
     WHERE document_id = ? \
     AND user_id = ?'
};

var users = {
  selectByGoogleId: 'SELECT * \
   FROM users \
   WHERE google_id = ?',
  selectById: 'SELECT * \
   FROM users \
   WHERE id = ?',
  insert: 'INSERT INTO users \
    VALUES (0, ?, ?, ?)'
};

var dbIniter = new _db2.default();
dbIniter.initDB();

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
_passport2.default.serializeUser(function (user, done) {
  console.log('Serialize:', user.id);
  done(null, user.id);
});

_passport2.default.deserializeUser(function (obj, done) {
  dbIniter.query(_mysql2.default.format(users.selectById, [obj]), function (error, results, fields) {
    if (error) {
      console.log(error);
      done(error);
      return;
    }
    console.log('Deserialize user by user id, ' + obj, results);
    return done(null, results[0]);
  });
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
_passport2.default.use(new _passportGoogleOauth2.default.OAuth2Strategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://morning-stream-82096.herokuapp.com/auth/google/callback",
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    // Check if user exists with google id
    dbIniter.query(_mysql2.default.format(users.selectByGoogleId, [profile.id]), function (error, results, fields) {
      if (error) {
        console.log(error);
        done(error);
        return;
      }
      console.log('Get user by googleId ' + profile.id, results);
      if (results.length) {
        return done(null, results[0]);
      } else {
        // Add new user to database
        dbIniter.query(_mysql2.default.format(users.insert, [profile.displayName, profile.emails.find(function (email) {
          return email.type == 'account';
        }).value, profile.id]), function (error, results, fields) {
          if (error) {
            console.log(error);
            done(error);
            return;
          }
          console.log('Inserted user', results);
          return done(null, {
            id: results.insertId,
            name: profile.displayName,
            email: profile.emails.find(function (email) {
              return email.type == 'account';
            }).value,
            google_id: profile.id
          });
        });
      }
    });
  });
}));

var app = (0, _express2.default)();
var upload = (0, _multer2.default)({ dest: 'uploads/' });

var buildFolderPath = process.env.DATABASE_URL ? _path2.default.resolve(__dirname, './', 'WimerReact/build') : _path2.default.resolve(__dirname, '..', 'WimerReact/build');
// logger
app.use((0, _morgan2.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(_express2.default.static(buildFolderPath));
app.use((0, _cookieParser2.default)());
app.use(_bodyParser2.default.json());
app.use((0, _expressSession2.default)({
  secret: 'cookie_secret',
  resave: true,
  saveUninitialized: true
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}, _passport2.default.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', _passport2.default.authenticate('google', {
  successRedirect: 'back',
  failureRedirect: 'back'
}));

app.get('/highlight/:documentId/:userId', function (req, res) {
  dbIniter.query(_mysql2.default.format(highlights.selectByDocumentAndUser, [req.params.documentId, req.params.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.delete('/highlight', function (req, res) {
  if (req.body.userId == req.user.id) {
    dbIniter.query(_mysql2.default.format(highlights.delete, [req.body.id, req.body.documentId, req.body.userId]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(fields);
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(403); // 403 Forbidden
  }
});

app.post('/highlight', function (req, res) {
  if (req.body.userId == req.user.id) {

    // save highlight from body
    dbIniter.query(_mysql2.default.format(highlights.insert, [req.body.id, req.body.start, req.body.end, req.body.class, req.body.container, req.body.documentId, req.body.userId]), function (error, results, fields) {
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

app.get('/documents/download/:id', function (req, res) {
  console.log(_mysql2.default.format(documents.selectById, [req.params.id]));
  dbIniter.query(_mysql2.default.format(documents.selectById, [req.params.id]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.download(results[0].path);
  });
});

app.post('/documents/update/:id', function (req, res) {
  if (req.user) {
    dbIniter.query(_mysql2.default.format(documents.update, [req.body.title, req.params.id, req.user.id]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json(results);
    });
  } else {
    res.json([]);
  }
});

app.get('/documents/:documentId/:userId', function (req, res) {
  dbIniter.query(_mysql2.default.format(documents.selectById, [parseInt(req.params.documentId, 10), parseInt(req.params.userId, 10)]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/documents', function (req, res) {
  if (req.user) {
    console.log('-------- DOCUMENTS --------');
    console.log('Session', req.session);
    console.log('SessionIdName: ', req.session.sessonIdName);
    console.log('SessionId: ', req.session.id);
    console.log('SessionId: ', req.sessionID);
    console.log('SessionCookie: ', req.session.cookie);
    console.log('Cookies: ', req.cookies);
    console.log('Signed Cookies: ', req.signedCookies);
    console.log('Auth: ', req.isAuthenticated());
    console.log('User: ', req.user);
    dbIniter.query(_mysql2.default.format(documents.selectAllByUser, [req.user.id]), function (error, results, field) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json(results);
    });
  } else {
    res.json([]);
  }
});

app.post('/upload', upload.single('doc'), function (req, res) {
  if (req.user) {
    var file = req.file;
    // save document info to db
    dbIniter.query(_mysql2.default.format(documents.insert, [0, file.originalname, file.path, file.mimetype, file.encoding, req.user.id]), function (error, results, fields) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      console.log(results);
      res.json({ id: results.insertId });
    });
  } else {
    res.sendState(403); // 403 Forbidden
  }
});

app.get('/user', function (req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json(undefined);
  }
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', function (req, res) {
  console.log("dirname:", __dirname);
  console.log('--------- INDEX.HTML path:', _path2.default.resolve(__dirname, '..', 'WimerReact/build', 'index.html'));
  console.log('--------- INDEX.HTML path:', _path2.default.resolve(__dirname, './', 'WimerReact/build', 'index.html'));
  if (process.env.DATABASE_URL) {
    res.sendFile(_path2.default.resolve(buildFolderPath, 'index.html'));
  } else {
    res.sendFile(_path2.default.resolve(buildFolderPath, 'index.html'));
  }
});

app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get("port") + '!');
});
//# sourceMappingURL=index.js.map