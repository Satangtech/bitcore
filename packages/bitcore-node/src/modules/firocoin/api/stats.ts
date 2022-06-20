import express = require('express');
import { BitcoinBlockStorage } from '../../../models/block';
import { CacheStorage } from '../../../models/cache';
import { TransactionStorage } from '../../../models/transaction';
import { WalletAddressStorage } from '../../../models/walletAddress';
import { resMessage } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    const cache = await CacheStorage.getGlobal('stats');
    if (cache) {
      return res.json(cache);
    }
    const totalTxns = await TransactionStorage.collection.countDocuments();
    const totalBlocks = await BitcoinBlockStorage.collection.countDocuments();
    const walletAddress = await WalletAddressStorage.collection.countDocuments();
    let blockTime = 0;
    if (totalBlocks > 1) {
      const lastBlock = await BitcoinBlockStorage.collection.findOne({ height: totalBlocks });
      const firstBlock = await BitcoinBlockStorage.collection.findOne({ height: 1 });
      blockTime = Math.abs((+lastBlock!.time - +firstBlock!.time) / (totalBlocks - 1)) / 1000; // sec
    }

    const result = {
      block_time: Math.round(blockTime * 100) / 100,
      total_txns: totalTxns,
      total_blocks: totalBlocks,
      wallet_address: walletAddress,
    };
    await CacheStorage.setGlobal('stats', result, 15 * CacheStorage.Times.Second);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send(resMessage((<any>err).message));
  }
});

module.exports = {
  router,
  path: '/stats',
};
