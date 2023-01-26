const MongoClient = require('mongodb').MongoClient;
const DB_PORT = process.env.DB_PORT || 27017;
const DB_HOST = process.env.DB_HOST || 'db';
const DB_NAME = process.env.DB_NAME || 'bitcore';
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const url = DB_USER ? `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/?authSource=${DB_NAME}` : `mongodb://${DB_HOST}:${DB_PORT}`;

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  const dbo = db.db(DB_NAME);
  const collection = 'txns';
  dbo.createCollection(
    collection,
    {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
      },
    },
    function (err, res) {
      if (err) {
        console.error(err);
        db.close();
      } else {
        console.log(`Collection ${collection} created!`);
        db.close();
      }
    }
  );
});

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  const dbo = db.db(DB_NAME);
  const collection = 'gas';
  dbo.createCollection(
    collection,
    {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
      },
    },
    function (err, res) {
      if (err) {
        console.error(err);
        db.close();
      } else {
        console.log(`Collection ${collection} created!`);
        db.close();
      }
    }
  );
});
