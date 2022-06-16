import express = require('express');
import { resMessage } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    const prices = {
      NXC: 0.33 * 1e9, // price in usd * 1e9
      FVM: 2 * 1e9,
    };
    res.json(prices);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

module.exports = {
  router,
  path: '/prices',
};
