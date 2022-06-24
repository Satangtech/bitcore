const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${process.env.DB_HOST}:27017/`;

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  const dbo = db.db(process.env.DB_NAME);
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
  const dbo = db.db(process.env.DB_NAME);
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
