var pgp = require('pg-promise')(/* options */);



// Connect to database using environment variables
const POSTGRES_USER = process.env.PGUSER.replace('/["]+/', '');
const POSTGRES_PASSWORD = process.env.PGPW.replace('/["]+/', '');
const POSTGRES_HOST = process.env.PGHOST.replace('/["]+/', '');
const POSTGRES_PORT = process.env.PGPORT.replace('/["]+/', '');

var db = pgp('postgres://'+POSTGRES_USER+':'+POSTGRES_PASSWORD+'@'+POSTGRES_HOST+':'+POSTGRES_PORT+'/Filth');

module.exports = db;