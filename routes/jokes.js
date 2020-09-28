var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var pgp = require('pg-promise')(/* options */)

require('dotenv').config();			// Now require dotenv for environment variables

// Connect to database using environment variables
const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');

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

router.get('/addJoke*', function(req, res,next) {
    if (req.query.tags.length != 0) {

        for (i = 0; i < req.query.tags.length; i++) {
            let tagsArray = req.query.tags;

            db.oneOrNone('SELECT "tid" FROM "public"."Tag" WHERE "name" = $1;', tagsArray[i]).then(function(tagsArray, iter, data) {
                console.log(tagsArray[0]);
                console.log(iter);
                if (data == undefined) {
                    console.log("No tag '" + tagsArray[iter] + "' found in db.");
                    db.any('INSERT INTO "public"."Tag"(name) VALUES ($1);', tagsArray[iter]).then(function(data) {
                        console.log("Data from inserting tag: " + data);
                        //res.json({'success': true, 'tid': data.tid});
                    }).catch(function(error) {
                        console.log('ERROR: ');
                        //res.json({'success': false, 'error': error});
                    });
                } else {
                    console.log("All tags are already added.");
                    
                    //res.json({'success': true, 'data': ''});
                }
            }.bind(null, req.query.tags, i)).catch(function(error) {
                console.log('ERROR: ', error);
                res.json({'success': false, 'error': error});
            });
        }   

        db.any('INSERT INTO "public"."Joke"(content, title) VALUES ($1, $2)', [req.query.content, req.query.name]).then(function(data) {
            console.log("Joke inserted successfuly, jid: " + data.jid);
            console.log(data);
            
            //res.json({'success': true})
        }).catch(function(error) {
            console.log('ERROR: ', error);
            res.json({'success': false, 'error': error});
        });

        var que = 'SELECT tid FROM "public"."Tag" WHERE "name" IN (';
        console.log("Length: " + req.query.tags.length);
        for (i = 0; i < req.query.tags.length; i++) {
            console.log(req.query.tags[i]);
            if (i == 0) {
                que = que.concat("'", req.query.tags[i], "'");
            } else que = que.concat(", '", req.query.tags[i], "'");
        }
        que = que.concat(');');
        console.log(que);
        var array = [];       
        db.any(que).then(function(array, data) {
            if (data.length != 0) {
                for (i = 0; i < data.length; i++) {
                    console.log("Data: " + data[i].tid);
                    array.push(data[i].tid);
                }
            }
            //console.log(data[0]);
            console.log("Saved ids: " + array);
            db.one('SELECT jid FROM "public"."Joke" WHERE "content" = $1;', req.query.content).then((data) => {
                console.log("Data: ", data.jid);
                for (i = 0; i < array.length; i++) {
                db.any('INSERT INTO "public"."JokesTags" VALUES ($1, $2)', [data.jid, array[i]]).then((data) => {
                    console.log("Tied two tables together.");
                    //res.json({'success': true});
                }).catch(error => {
                    console.log("ERROR: ", error);
                    res.json({'success': false, 'error': error});
                });
            }
            }).catch(error => {
                console.log("ERROR: ", error);
                res.json({'success': false, 'error': error});
            });

        }.bind(null, array)).catch((error) => {
            console.log("ERROR: ", error);
            res.json({'success': false, 'error': error});
        });
        res.json({'success': true});
    }

    //db.none('INSERT INTO "public"."Jokes" VALUES ');
    //res.send("Params are: " + req.query.name + ", " + req.query.content + ", " + req.query.tags); /// Tags - будет массив, поэтому можно получать несколько тэгов
    //res.send("Tags size: " + req.query.tags.length);
});


module.exports = router;
