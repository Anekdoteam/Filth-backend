var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var pgp = require('pg-promise')(/* options */);

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');

var db = pgp('postgres://'+POSTGRES_USER+':'+POSTGRES_PASSWORD+'@'+POSTGRES_HOST+':'+POSTGRES_PORT+'/Filth');

passport.use(new LocalStrategy((username, password, done) => {
  console.log("Data for strategy: " + username + ", " + password);
  db.oneOrNone('SELECT "password" FROM "public"."User" WHERE "username" = $1;', username).then(function (data, credentials) {
    console.log("username: " + username);
    if (!data) {
      console.log("works");
      return done(null, false, {message: "User not found"});
    } else {
      console.log("Type of cred: " + typeof(credentials.password) + " and type of dbpw: " + typeof(data));

      console.log("Passwords: " + data.valueOf() + " and " + credentials.password.valueOf());

      if (data.trim() == credentials.password.trim()) {
        console.log("Password correct");
        return done(null, {un: username, pw: data.trim()});
      } else {
        console.log("Password incorrect.");
        data = null;
        return done(null, false, {message: "Password incorrect"});
      }

      //if (data)
    }
  }.bind(null, password)).catch((error) => {
    console.log('ERROR: ', error);
    return done(null, false, {message: "An exception has occured."});
  });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.post('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true}), (req, res, next) => {
  console.log("Request body: " + JSON.stringify(req.body));

  //res.redirect('/');
  res.json({"ok": true});
});

router.get('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true}), (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("You are authenticated"); 
  }
  console.log("Request body: " + JSON.stringify(req.body));

  res.json({"ok": true});
});




module.exports = router;