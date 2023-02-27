import express = require('express');
import { CoinStorage } from '../../../models/coin';
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { Storage } from '../../../services/storage';
import { TokenBalanceStorage } from '../models/tokenBalance';
import { formatHexAddress, fromHexAddress, resMessage, toHexAddress } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/:address/detail', async (req, res) => {
  let { chain, network, address } = req.params;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    const nativeAddress = fromHexAddress(address, network);
    const { balance } = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address: nativeAddress,
      args: req.query,
    });

    const transactionNative = (
      await CoinStorage.collection
        .aggregate([
          { $match: { address: nativeAddress } },
          {
            $group: {
              _id: '$mintTxid',
            },
          },
        ])
        .toArray()
    ).map(tx => tx._id);
    const transactionEVM = (
      await TransactionStorage.collection
        .find({ chain, network, 'receipt.from': address })
        .project({ _id: 0, txid: 1 })
        .toArray()
    ).map(tx => tx.txid);

    const tokens = await TokenBalanceStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'tokens',
            let: {
              tokenAddress: '$contractAddress',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$contractAddress', '$$tokenAddress'],
                  },
                },
              },
            ],
            as: 'tokens',
          },
        },
        { $match: { address, chain, network } },
        { $unwind: '$tokens' },
        {
          $project: {
            contractAddress: 1,
            balance: { $toString: '$balance' },
            name: '$tokens.name',
            symbol: '$tokens.symbol',
            decimal: '$tokens.decimals',
          },
        },
        { $sort: { _id: -1 } },
      ])
      .toArray();

    res.json({
      balance,
      tokens,
      transactionNativeCount: transactionNative.length,
      transactionEVMCount: transactionEVM.length,
      transactionTotalCount: new Set((<any>transactionNative).concat(transactionEVM)).size,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/:address/detail/tx', async (req, res) => {
  let { chain, network, address } = req.params;
  let { limit, page, contractAddress } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    limit = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limit : 0;
    const sort = { _id: -1 };
    const addressFiro = fromHexAddress(address, network);
    const txNativeSpent = (
      await CoinStorage.collection
        .aggregate([
          { $match: { address: addressFiro, spentTxid: { $exists: true } } },
          {
            $group: {
              _id: '$spentTxid',
            },
          },
          { $sort: sort },
          { $limit: 500 },
        ])
        .toArray()
    ).map(tx => tx._id);

    const txNativeMint = (
      await CoinStorage.collection
        .aggregate([
          { $match: { address: addressFiro, mintTxid: { $exists: true } } },
          {
            $group: {
              _id: '$mintTxid',
            },
          },
          { $sort: sort },
          { $limit: 500 },
        ])
        .toArray()
    ).map(tx => tx._id);

    const condition: any = [
      contractAddress
        ? { chain, network, 'receipt.from': address, 'receipt.contractAddress': contractAddress }
        : { chain, network, 'receipt.from': address },
      contractAddress
        ? { chain, network, 'receipt.to': address, 'receipt.contractAddress': contractAddress }
        : { chain, network, 'receipt.to': address },
      contractAddress
        ? {
            chain,
            network,
            'receipt.decodedCallData.params.value': `0x${address}`,
            'receipt.contractAddress': contractAddress,
          }
        : {
            chain,
            network,
            'receipt.decodedCallData.params.value': `0x${address}`,
          },
    ];
    if (contractAddress === undefined && txNativeSpent.length > 0) {
      condition.push({ chain, network, txid: { $in: txNativeSpent } });
    }
    if (contractAddress === undefined && txNativeMint.length > 0) {
      condition.push({ chain, network, txid: { $in: txNativeMint } });
    }

    const query = { $or: condition };
    const args = { skip, sort, limit };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/:address/detail/tokentransfers', async (req, res) => {
  let { chain, network, address } = req.params;
  let { limit, page } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    limit = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limit : 0;
    const sort = { _id: -1 };
    const query = {
      chain,
      network,
      $or: [{ 'receipt.from': address }, { 'receipt.to': address }],
      'receipt.decodedCallData.name': 'transfer',
    };
    const args = { skip, sort, limit };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/:address/detail/tokens', async (req, res) => {
  let { chain, network, address } = req.params;
  let { limit, page } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    limit = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limit : 0;
    const tokens = await TokenBalanceStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'tokens',
            let: {
              tokenAddress: '$contractAddress',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$contractAddress', '$$tokenAddress'],
                  },
                },
              },
            ],
            as: 'tokens',
          },
        },
        { $match: { address, chain, network } },
        { $unwind: '$tokens' },
        {
          $project: {
            address: 1,
            contractAddress: 1,
            chain: 1,
            network: 1,
            balance: { $toString: '$balance' },
            txid: '$tokens.txid',
            name: '$tokens.name',
            symbol: '$tokens.symbol',
            type: 'erc20',
            decimal: '$tokens.decimals',
          },
        },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();
    res.json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

module.exports = {
  router,
  path: '/address',
};
