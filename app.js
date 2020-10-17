var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var flash = require('connect-flash');
var session = require('express-session');
var pgp = require('pg-promise')(/* options */);

var indexRouter = require('./routes/index');
var jokesRouter = require('./routes/jokes');
var loginRouter = require('./routes/login');


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();
app.use(session({cookie: {maxAge: 6000}, secret: 'bruev', resave: false, saveUninitialized: false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser('keyboard cat'));

app.use(flash());


app.use('/', indexRouter);
app.use('/jokes', jokesRouter);
//app.use('/login', loginRouter);
app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true}), (res, req) => {
	res.json({lol: "kek"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');

var db = pgp('postgres://'+POSTGRES_USER+':'+POSTGRES_PASSWORD+'@'+POSTGRES_HOST+':'+POSTGRES_PORT+'/Filth');

passport.use(new LocalStrategy((username, password, done) => {
	db.oneOrNone('SELECT "password" FROM "public"."User" WHERE "username" = $1;', username).then(function (password, data) {
		if (!data) {
			console.log("works");
			return done(null, false, {message: "User not found"});
		} else {
			console.log("Data: " + data);
			//if (data)
		}
	}.bind(password)).catch((error) => {
		console.log('ERROR: ', error);
		res.json({'success': false, 'error': error});
	})
}));

module.exports = app;
