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

/// Это стратегия аутентификации, для аутентификации используются URLEncoded параметры username и password
passport.use(new LocalStrategy((username, password, done) => {
  console.log("Data for strategy: " + username + ", " + password);
  db.oneOrNone('SELECT "password" FROM "public"."User" WHERE "username" = $1;', username).then(function (data, credentials) {
    console.log("username: " + username);
    if (!data) {
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
    }
  }.bind(null, password)).catch((error) => {
    console.log('ERROR: ', error);
    return done(null, false, {message: "An exception has occured."});
  });
}));

/// Сериализуем пользователя в куки
passport.serializeUser((user, done) => {
  done(null, user.un);
});

/// Получаем пользователя из куки
passport.deserializeUser((username, done) => {
	db.one('SELECT "password" FROM "public"."User" WHERE "username" = $1;', username).then((err, username, data) => {
		done(err, {un: username, pw: data.trim()});
	})
});

router.post('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}), function (req, res) {
	if (req.isAuthenticated()) {
    	console.log("You are authenticated"); 
 	}
 	console.log("Req: " + JSON.stringify(req));
    console.log("Request body: " + JSON.stringify(req.body));

});

router.get('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}), function (req, res) {
  if (req.isAuthenticated()) {
    console.log("You are authenticated"); 
  }
  console.log("Req: " + JSON.stringify(req));
  console.log("Request body: " + JSON.stringify(req.body));

});




module.exports = router;