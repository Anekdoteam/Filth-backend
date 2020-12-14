var express = require('express');
var router = express.Router();
var util = require('util');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var db = require('./../database.js');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.post('/', (req, res, next) => {
	console.log("Req body: " + util.inspect(req.body));
	var salt = bcrypt.genSaltSync(5);
	var hashedPassword = bcrypt.hashSync(req.body.password, salt);

	bcrypt.genSalt(5, function(err, salt) {
    	bcrypt.hash(req.body.password, salt, function(err, hash) {
        	db.oneOrNone('INSERT INTO "public"."User" (username, password, email) VALUES ($1, $2, $3) RETURNING uid', [req.body.username, hash, req.body.email]).then((data) => {
				console.log("Inserted new user successfuly, id: " + data.uid);
				res.json({'success': true, 'message': "Registration successful"});
			}).catch((error) => {
				console.log('ERROR: ', error);
		        res.json({'success': false, 'error': error});
			});
    	});
	});
	
})

module.exports = router;