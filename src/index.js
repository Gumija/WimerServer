import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import mysql from 'mysql';
import passport from 'passport';
import GoogleAuth from 'passport-google-oauth';
import path from 'path';
import DbIniter from './db/db';
import visitsHandler from './visits';
import documentsHandler from './documents';
import highlightHandler from './highlights';
import hasher from './hasher';

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  , GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

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



let dbIniter = DbIniter;
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
  req.logout();
  req.session.destroy(function (err) {
    //Inside a callback… bulletproof!
    res.sendStatus(200);
  });
})

app.use('/highlight', highlightHandler);
app.use('/documents', documentsHandler);
app.use('/visits', visitsHandler);

app.get('/user', (req, res) => {
  if (req.user) {
    res.json({...req.user, id: hasher.encode(req.user.id)});
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