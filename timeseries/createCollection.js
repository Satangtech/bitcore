const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${process.env.DB_HOST}:27017/`;

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  const dbo = db.db(process.env.DB_NAME);
  dbo.createCollection(
    'txns',
    {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
      },
    },
    function (err, res) {
      if (err) throw err;
      console.log('Collection created!');
      db.close();
    }
  );
});
