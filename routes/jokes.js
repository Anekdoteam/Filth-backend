var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var pgp = require('pg-promise')(/* options */)

// Database connection
const POSTGRES_USER = 'postgres'
const POSTGRES_PASSWORD = 'root'
const POSTGRES_HOST = 'localhost'
const POSTGRES_PORT = '5432'
var db = pgp('postgres://'+POSTGRES_USER+':'+POSTGRES_PASSWORD+'@'+POSTGRES_HOST+':'+POSTGRES_PORT+'/Filth') // TODO: change hardcoded constants to env variables


router.get('/', function(req, res, next) {
    next(createError(403));
});

// Get all jokes from the database
router.get('/getJokes', function(req, res, next) {
    db.any('SELECT * FROM public."Joke" AS jokes')
        .then(function (data) {
            if(data.length==0){
                console.log('No jokes returned');
                res.json({'success':true,'jokes':[]});
            }else{
                console.log('Successfully returned some jokes, count: '+data.length);
                res.json({'success':true,'jokes':data});
            }
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
            res.json({'success':false,'error':error});
        })
});


module.exports = router;
