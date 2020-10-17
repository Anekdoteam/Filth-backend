var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var passport = require('passport');


/*router.get('/', (res, req, next) => {
	next(createError(403));
});*/


router.post('/', (req, res, next) => {
	passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true});
	res.json({"ok": true});
});

module.exports = router;