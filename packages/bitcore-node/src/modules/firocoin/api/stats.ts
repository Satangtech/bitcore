import express = require('express');
import { BitcoinBlockStorage } from '../../../models/block';
import { TransactionStorage } from '../../../models/transaction';
import { WalletAddressStorage } from '../../../models/walletAddress';
import { resMessage } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    const totalTxns = await TransactionStorage.collection.countDocuments();
    const totalBlocks = await BitcoinBlockStorage.collection.countDocuments();
    const walletAddress = await WalletAddressStorage.collection.countDocuments();
    let blockTime = 0;
    if (totalBlocks > 1) {
      const blocks = await BitcoinBlockStorage.collection.find({}).sort({ _id: -1 }).limit(2).toArray();
      blockTime = Math.abs(+blocks[0].time - +blocks[1].time) / 1000; // sec
    }

    const result = {
      block_time: blockTime,
      total_txns: totalTxns,
      total_blocks: totalBlocks,
      wallet_address: walletAddress,
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

module.exports = {
  router,
  path: '/stats',
};
