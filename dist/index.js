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

var _passportGoogleOauth = require('passport-google-oauth2');

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
console.log('GOOGLE STUFF:', GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
_passport2.default.serializeUser(function (user, done) {
  done(null, user);
});

_passport2.default.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
_passport2.default.use(new _passportGoogleOauth2.default.Strategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  //NOTE :
  //Carefull ! and avoid usage of Private IP, otherwise you will get the device_id device_name issue for Private IP during authentication
  //The workaround is to set up thru the google cloud console a fully qualified domain name such as http://mydomain:3000/ 
  //then edit your /etc/hosts local file to point on your private IP. 
  //Also both sign-in button + callbackURL has to be share the same url, otherwise two cookies will be created and lead to lost your session
  //if you use it.
  callbackURL: "http://morning-stream-82096.herokuapp.com/auth/google/callback",
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {

    // To keep the example simple, the user's Google profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Google account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
}));

var dbIniter = new _db2.default();
dbIniter.initDB();

var documents = {
  insert: 'INSERT INTO documents \
     VALUES (?, ?, ?, ?, ?)',
  selectAll: 'SELECT * \
     FROM documents',
  selectById: 'SELECT * \
     FROM documents \
     WHERE id = ?',
  update: 'UPDATE documents \
     SET title = ? \
     WHERE id = ?'
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

var app = (0, _express2.default)();
var upload = (0, _multer2.default)({ dest: 'uploads/' });

var buildFolderPath = process.env.DATABASE_URL ? _path2.default.resolve(__dirname, './', 'WimerReact/build') : _path2.default.resolve(__dirname, '..', 'WimerReact/build');
// logger
app.use((0, _morgan2.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(_express2.default.static(buildFolderPath));
app.use(_bodyParser2.default.json());
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', _passport2.default.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', _passport2.default.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
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
  dbIniter.query(_mysql2.default.format(highlights.delete, [req.body.id, req.body.documentId, req.body.userId]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(fields);
    res.sendStatus(200);
  });
});

app.post('/highlight', function (req, res) {
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
  dbIniter.query(_mysql2.default.format(documents.update, [req.body.title, req.params.id]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/documents/:id', function (req, res) {
  dbIniter.query(_mysql2.default.format(documents.selectById, [parseInt(req.params.id, 10)]), function (error, results, fields) {
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
  dbIniter.query(documents.selectAll, function (error, results, field) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.post('/upload', upload.single('doc'), function (req, res) {
  var file = req.file;
  // save document info to db
  dbIniter.query(_mysql2.default.format(documents.insert, [0, file.originalname, file.path, file.mimetype, file.encoding]), function (error, results, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    console.log(results);
    res.json({ id: results.insertId });
  });
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