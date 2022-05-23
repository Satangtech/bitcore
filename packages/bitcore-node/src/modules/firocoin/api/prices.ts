import express = require('express');
import { TokenStorage } from '../models/token';
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    const prices = {
      NXC: 0.33 * 1e9, // price in usd * 1e9
      FVM: 2 * 1e9,
    };
    res.json(prices);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:contractAddress', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  try {
    const token = await TokenStorage.collection.findOne({ chain, network, contractAddress });
    if (token) {
      res.json({
        [token.contractAddress]: {
          symbol: token.symbol,
          price: 0.787 * 1e9,
        },
      });
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/prices',
};
