var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var flash = require('connect-flash');
var session = require('cookie-session');

var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var jokesRouter = require('./routes/jokes');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('bruev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({name: 'sampleCookie', keys: ['bruev'], maxAge: 30 * 24 * 60 * 60 * 1000, domain: '.site-smeshnoy.me', saveUninitialized: false, resave: true}));
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors({
  origin: 'http://front.site-smeshnoy.me:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use(flash());
// Disable x-powered-by fingerprinting
app.disable("x-powered-by");

app.use('/', indexRouter);
app.use('/jokes', jokesRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);



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


module.exports = app;
