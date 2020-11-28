var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var bodyParser = require('body-parser');

var db = require('./../database.js');

/*require('dotenv').config();			// Now require dotenv for environment variables

// Connect to database using environment variables
const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');*/

router.get('/', function(req, res, next) {
  next(createError(403));
});

/// Параметры - offset (начиная с какого), limit (сколько)(!!!) и sort (0(desc)|1(asc))
router.get('/getJokes/:offset-:limit&:sort', function(req, res, next) {
  var sorter;
  if (req.params.sort == 1) {
    sorter = 'SELECT * FROM public."Joke" AS jokes ORDER BY "jid" ASC OFFSET $1 LIMIT $2;';
  } else if (req.params.sort == 0) {
    sorter = 'SELECT * FROM public."Joke" AS jokes ORDER BY "jid" DESC OFFSET $1 LIMIT $2;';
  }
  db.any(sorter, [req.params.offset, req.params.limit])
    .then(function (data) {
      if (data.length==0) {
        console.log('No jokes returned');
        res.json({'success':true,'jokes':[]});
      } else {
        console.log('Successfully returned some jokes, count: '+data.length);
        res.json({'success':true,'jokes':data});
      }
    })
    .catch(function (error) {
      console.log('ERROR: ', error);
      res.json({'success':false,'error':error});
    });
});


/// Единственный параметр - tag (тэг, по которому ведётся поиск)
router.get('/getJokesByTag/:tag', function(req, res, next) {
  db.any('SELECT * FROM ("public"."Joke" JOIN "public"."JokesTags" ON "Joke"."jid" = "JokesTags"."jid") as "joined" WHERE "joined"."tid" IN (SELECT "tid" FROM "public"."Tag" WHERE "name" = $1);', req.params.tag)
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
    }); 
});


/// Параметры - name (название шутки), content (текст шутки) и tags (массив тэгов). 
router.post('/addJoke*', function(req, res,next) {
    console.log("[!!!!!] BODY: ", req.body);
  db.oneOrNone('SELECT * FROM "public"."Joke" WHERE "content" = $1', req.body.content).then(data => {
    console.log("Unique checking: " + data);
    if (data == null) {
      if (Array.isArray(req.body.tags)) {
        console.log("tags is array, so there're 2 or more tags.");
      } else console.log("Just one tag.");

      if (req.body.tags.length != 0) {
        var cycleCounter;
        if (Array.isArray(req.body.tags)) {
          cycleCounter = req.body.tags.length;
        } else cycleCounter = 1;

        for (var i = 0; i < cycleCounter; i++) {
          let tagsArray;
          if (Array.isArray(req.body.tags)) {
            console.log("Checking array:", req.body.tags[i]);
            tagsArray = req.body.tags[i];
          } else {
            tagsArray = req.body.tags;
          }

          db.oneOrNone('SELECT "tid" FROM "public"."Tag" WHERE "name" = $1;', tagsArray).then(function(tagsArray, iter, data) {
            console.log(tagsArray);
            console.log(iter);
            if (data == undefined) {
              console.log("No tag '" + tagsArray + "' found in db.");
              db.any('INSERT INTO "public"."Tag"(name) VALUES ($1);', tagsArray).then(function(data) {
                console.log("Data from inserting tag: " + data);
              }).catch(function(error) {
                console.log('ERROR: ');
                res.json({'success': false, 'error': error});
              });
            } else {
              console.log("All tags are already added.");
            }
          }.bind(null, tagsArray, i)).catch(function(error) {
            console.log('ERROR: ', error);
            res.json({'success': false, 'error': error});
          });
        }   

        db.any('INSERT INTO "public"."Joke"(content, title) VALUES ($1, $2)', [req.body.content, req.body.name]).then(function(data) {
          console.log("Joke inserted successfuly, jid: " + data.jid);
          console.log(data);
        }).catch(function(error) {
          console.log('ERROR: ', error);
          res.json({'success': false, 'error': error});
        });

        var que = 'SELECT tid FROM "public"."Tag" WHERE "name" IN (';
        console.log("Length: " + req.body.tags.length);
        for (var i = 0; i < cycleCounter; i++) {
          console.log(req.body.tags[i]);
          if (Array.isArray(req.body.tags)) {
            if (i == 0) {
              que = que.concat("'", req.body.tags[i], "'");
            } else que = que.concat(", '", req.body.tags[i], "'");
          } else {
            que = que.concat("'", req.body.tags, "'");
          }

        }
        que = que.concat(');');
        console.log(que);
        var array = [];       
        db.any(que).then(function(array, data) {
          if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
              console.log("Data: " + data[i].tid);
              array.push(data[i].tid);
            }
          }
          console.log("Saved ids: " + array);
          db.one('SELECT jid FROM "public"."Joke" WHERE "content" = $1;', req.body.content).then((data) => {
            console.log("Data: ", data.jid);
            for (var i = 0; i < array.length; i++) {
              db.any('INSERT INTO "public"."JokesTags" VALUES ($1, $2)', [data.jid, array[i]]).then((data) => {
                console.log("Tied two tables together.");
              }).catch(error => {
                console.log("ERROR: ", error);
                res.json({'success': false, 'error': error});
              });
            }
          }).catch((error) => {
            console.log("ERROR: ", error);
            res.json({'success': false, 'error': error});
          });

        }.bind(null, array)).catch((error) => {
          console.log("ERROR: ", error);
          res.json({'success': false, 'error': error});
        });
        res.json({'success': true});
      }
    } else {
      res.json({'success': false, 'reason': "This joke was already added by someone else."});
    }
  }).catch(error => {
    console.log("ERROR: ", error);
    res.json({'success': false, 'error': error});
  });
});


/// Параметры - jid (идентификатор шутки), uid (идентификатор пользователя) 
router.get('/likeJoke/:uid/:jid', function(req, res, next) {
  console.log(req.params);
  db.oneOrNone('SELECT count(*) as "cnt", "isLiked" FROM "public"."UsersJokes" WHERE "uid" = $1 AND "jid" = $2 GROUP BY "isLiked";', [req.params.uid, req.params.jid]).then(data => {
    console.log("Data: ", data);
    if (data.cnt == 0) {
      db.none('INSERT INTO "public"."UsersJokes" VALUES ($1, $2, true)', [req.params.uid, req.params.jid]).then(data => {
        console.log("Data: ", data);
      }).catch(error => {
        console.log("ERROR: ", error);
        res.json({'success': false, 'error': error});
      });

      db.none('UPDATE "public"."Joke" SET "rating" = "rating" + 1 WHERE "jid" = $1;', req.params.jid).then((data) => {
        console.log("Like added successfuly, query result: ", data);
        res.json({'success': true});
      }).catch(error => {
        console.log('ERROR: ', error);
        res.json({'success': false, 'error': error});
      });
    } else if (data.cnt == 1) {
      var rateSign, rateBool, resultString, jsonResult;
      if (data.isLiked == true) {
        rateSign = '-';
        rateBool = 'false';
        resultString = 'Un-liked successfuly, ';
        jsonResult = 'un-liked';
      } else {
        rateSign = '+';
        rateBool = 'true';
        resultString = 'Liked successfuly, ';
        jsonResult = 'liked';
      }

      db.none('UPDATE "public"."Joke" SET "rating" = "rating" ' + rateSign + ' 1 WHERE "jid" = $1;', req.params.jid).then((data) => {
        console.log(resultString, data);
        res.json({'success': true, 'action': jsonResult});
      }).catch(error => {
        console.log('ERROR: ', error);
        res.json({'success': false, 'error': error});
      });

      db.none('UPDATE "public"."UsersJokes" SET "isLiked" = ' + rateBool + ' WHERE "uid" = $1 AND "jid" = $2;', [req.params.uid, req.params.jid]).then(data => {
        console.log("Data: ", data);
      }).catch(error => {
        console.log("ERROR: ", error);
        res.json({'success': false, 'error': error});
      });
    }

  }).catch(error => {
    console.log("ERROR: ", error);
    res.json({'success': false, 'error': error});
  });

});


module.exports = router, db;
