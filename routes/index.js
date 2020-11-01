var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', (req, res, next) => {
	res.json({message: "This is a temporary POST page."});
	if (req.isAuthenticated()) {
    	console.log("You are authenticated"); 
 	}
 	console.log("Cookie data from req:" + req.cookie);
  	console.log("Request body: " + JSON.stringify(req.body));
})

module.exports = router;
