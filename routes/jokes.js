var express = require('express');
var router = express.Router();
var createError = require('http-errors');


router.get('/', function(req, res, next) {
    next(createError(403));
});

router.get('/getJokes', function(req, res, next) {
    res.json({"jokes":[{"text":"123"},{"text":"432"}]});
});


module.exports = router;
