import express = require('express');
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    res.json({
      NXC: 0.33 * 1e9, // price in usd * 1e9
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/prices',
};
