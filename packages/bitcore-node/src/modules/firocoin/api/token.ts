import { TransactionStorage } from '../../../models/transaction';
import { Storage } from '../../../services/storage';
import { EvmDataStorage } from '../models/evmData';
import { IToken, TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import express = require('express');
const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const { chain, network } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 20;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network };
    const args = { skip, sort, limit: limitPage };
    const tokenBalances = await TokenBalanceStorage.collection
      .aggregate([
        {
          $group: {
            _id: {
              chain: '$chain',
              network: '$network',
              contractAddress: '$contractAddress',
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    Storage.apiStreamingFind(TokenStorage, query, args, req, res, (t) => {
      const convertedToken = TokenStorage._apiTransform(t, { object: true }) as Partial<IToken>;
      const holders = tokenBalances.filter((token: any) => token._id.contractAddress === t.contractAddress);
      return JSON.stringify({ ...convertedToken, holders: holders.length > 0 ? (<any>holders[0]).count : 0 });
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:contractAddress', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  try {
    const token = await TokenStorage.collection.findOne({ chain, network, contractAddress });
    if (token) {
      token['transfers'] = await TransactionStorage.collection.countDocuments({
        'receipt.events.type': 'transfer',
        'receipt.log.address': contractAddress,
      });
      token['holders'] = await TokenBalanceStorage.collection.countDocuments({
        contractAddress,
      });
      const evmData = await EvmDataStorage.collection.findOne({ chain, network, txid: token.txid });
      token['byteCode'] = evmData ? evmData.byteCode : '';
      token.totalSupply = token.totalSupply.toString();
      token['price'] = 0.787 * 1e9; // price in usd * 1e9
      res.json(token);
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:contractAddress/tx', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 3;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network, 'receipt.log.address': contractAddress };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:contractAddress/tokentransfers', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 3;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network, 'receipt.log.address': contractAddress };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:contractAddress/tokenholder', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network, contractAddress };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TokenBalanceStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/token',
};
