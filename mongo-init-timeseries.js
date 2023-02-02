db.createCollection('txns', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata'
  }
});

db.createCollection('gas', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata'
  }
});
