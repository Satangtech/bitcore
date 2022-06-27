import express = require('express');
import { BitcoinBlockStorage } from '../../../models/block';
import { CacheStorage } from '../../../models/cache';
import { TransactionStorage } from '../../../models/transaction';
import { WalletAddressStorage } from '../../../models/walletAddress';
// import { GasStorage } from '../models/gas';
// import { TxnsStorage } from '../models/txns';
import { addMonths, addSeconds, randomIntFromInterval, resMessage } from '../utils';
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

router.get('/gashistory', async (req, res) => {
  let { from, to, interval } = req.query;
  from = from ? new Date(from) : addMonths(new Date(), -6);
  to = to ? new Date(to) : new Date();
  interval = interval ? Number(interval) : 300; // 5 minutes
  try {
    // const gas = await GasStorage.collection
    //   .aggregate([
    //     {
    //       $match: {
    //         timestamp: { $gte: from, $lte: to },
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: { $dateTrunc: { date: '$timestamp', unit: 'second', binSize: interval } },
    //         avgPrice: { $avg: '$gasPrice' },
    //       },
    //     },
    //     {
    //       $project: {
    //         t: '$_id',
    //         a: '$avgPrice',
    //         _id: false,
    //       },
    //     },
    //     {
    //       $sort: {
    //         t: 1,
    //       },
    //     },
    //   ])
    //   .toArray();
    // res.json(gas);
    let startDate = from;
    const result: any = [];
    while (startDate <= to) {
      result.push({
        t: startDate,
        a: randomIntFromInterval(50, 75),
      });
      startDate = addSeconds(startDate, interval);
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/txnshistory', async (req, res) => {
  let { from, to, interval } = req.query;
  from = from ? new Date(from) : addMonths(new Date(), -6);
  to = to ? new Date(to) : new Date();
  interval = interval ? Number(interval) : 86400; // a day
  try {
    // const txns = await TxnsStorage.collection
    //   .aggregate([
    //     {
    //       $match: {
    //         timestamp: { $gte: from, $lte: to },
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: { $dateTrunc: { date: '$timestamp', unit: 'second', binSize: interval } },
    //         count: { $count: {} },
    //       },
    //     },
    //     {
    //       $project: {
    //         t: '$_id',
    //         c: '$count',
    //         _id: false,
    //       },
    //     },
    //     {
    //       $sort: {
    //         t: 1,
    //       },
    //     },
    //   ])
    //   .toArray();
    // res.json(txns);
    let startDate = from;
    const result: any = [];
    while (startDate <= to) {
      result.push({
        t: startDate,
        c: randomIntFromInterval(100, 150),
      });
      startDate = addSeconds(startDate, interval);
    }
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
