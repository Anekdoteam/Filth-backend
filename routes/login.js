var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var db = require('./../database.js');

console.log("DEBUG DB OBJ: " + db);

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');

/// Это стратегия аутентификации, для аутентификации используются URLEncoded параметры username и password
passport.use(new LocalStrategy((username, password, done) => {
	console.log("Data for strategy: " + username + ", " + password);
	db.oneOrNone('SELECT "password" FROM "public"."User" WHERE "username" = $1;', username).then(function (data, credentials) {
	console.log("username: " + username);
	if (!data) {
	  return done(null, false, {message: "User not found"});
	} else {
	  console.log("Type of cred: " + typeof(credentials.password) + " and type of dbpw: " + typeof(data));

	  console.log("pass from user: " + credentials.password.trim() + ", pass from db: " + data.trim());
	  bcrypt.compare(data.trim(), credentials.password.trim(), (err, result) => {
	  	if (result == true) {
	  		console.log("Password correct");
	    	return done(null, username);
	  	} else {
	    	console.log("Password incorrect, error: " + err);
	    	return done(null, false, {message: "Password incorrect"});
	  	}
	  });
	}
	}.bind(null, password)).catch((error) => {
	console.log('ERROR: ', error);
	return done(null, false, {message: "An exception has occured."});
	});
}));

/// Сериализуем пользователя в куки
passport.serializeUser((username, done) => {
  done(null, username);
});

/// Получаем пользователя из куки
passport.deserializeUser((username, done) => {
	done(null, username);
});

// Now redirecting to /failure in case of failed auth
router.post('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login/failure'}), function (req, res) {

	if (req.isAuthenticated()) {
		res.append('Cache-Control', 'no-store');
    	res.append('Access-Control-Allow-Credentials', true);
  		res.json({'success': true, 'message': 'Auth successful'});
   		console.log("You are authenticated"); 
 	}
 	console.log("Req: " + JSON.stringify(req));
    console.log("Request body: " + JSON.stringify(req.body));

});

// This endpoint is for testing purposes only and will be removed someday
router.get('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}), function (req, res) {
  if (req.isAuthenticated()) {
  	res.append('Access-Control-Allow-Credentials', true);
  	res.json({'success': true, 'message': 'Auth successful'});
    console.log("You are authenticated"); 
  }
  console.log("Req: " + JSON.stringify(req));
  console.log("Request body: " + JSON.stringify(req.body));

});

function checkAuth(req, res, next) {
	if (req.user) {
		console.log("User logged");
		req.flash("User logged in");
		return next();
	} else {
		req.flash("User not logged in.");
		console.log("User not logged.");
		res.redirect('/login');
	}
}

router.get('/check', checkAuth, (req, res) => {
	res.redirect('/');
})

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
})

router.post('/failure', (req, res) => {
	res.json({'success': false, 'error': 'Wrong credentials.'});
})




module.exports = router;