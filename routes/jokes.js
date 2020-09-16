var express = require('express');
var router = express.Router();
var createError = require('http-errors');


router.get('/', function(req, res, next) {
    next(createError(403));
});

router.get('/getJokes', function(req, res, next) {
    res.json({"jokes":[{"text":"123"},{"text":"432"}]});
});

router.get('/getJokesByTag/:tag', function(req, res, next) {
	db.any('SELECT * FROM ("public"."Joke" JOIN "public"."JokesTags" ON "Joke"."jid" = "JokesTags"."jid") as "joined" WHERE "joined"."tid" IN (SELECT "tid" FROM "public"."Tag" WHERE "name" = $1) LIMIT 1;', req.params.tag) // remove LIMIT 1 after making "name" unique
	.then(function(data) {
		if (data.length == 0) {
			console.log('No jokes found by this tag.');
			res.json({'success': true, 'jokes': []});
		} else {
			console.log('Found '+data.length+' jokes by tag "'+req.params.tag+'".');
			res.json({'success': true, 'jokes': data});
		}
	}).catch(function (error) {
		console.log('ERROR: ', error);
		res.json({'success': false, 'error': error});
	}) 
});


module.exports = router;
