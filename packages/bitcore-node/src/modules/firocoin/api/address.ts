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
    const balanceAddress = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address: nativeAddress,
      args: req.query,
    });
    const balance = balanceAddress.balance;

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
    ).map((tx) => tx._id);
    const transactionEVM = (
      await TransactionStorage.collection
        .find({ chain, network, 'receipt.from': address })
        .project({ _id: 0, txid: 1 })
        .toArray()
    ).map((tx) => tx.txid);

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
  const { limit, page, contractAddress } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const addressFiro = fromHexAddress(address, network);

    const qry = {
      chain,
      network,
      $or: [
        { 'coins.address': addressFiro },
        { 'receipt.from': address },
        { 'receipt.to': address },
        { 'receipt.decodedCallData.params.value': `0x${address}` },
      ],
    };
    if (contractAddress) {
      qry['receipt.contractAddress'] = contractAddress;
    }

    const txs = await TransactionStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'coins',
            let: {
              spentTxid: '$spentTxid',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$txid', '$$spentTxid'],
                  },
                  address: addressFiro,
                },
              },
            ],
            as: 'coins',
          },
        },
        {
          $match: qry,
        },
        {
          $project: {
            coins: 0,
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limitPage + skip },
      ])
      .toArray();
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/:address/detail/tokentransfers', async (req, res) => {
  let { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = {
      chain,
      network,
      $or: [{ 'receipt.from': address }, { 'receipt.to': address }],
      'receipt.decodedCallData.name': 'transfer',
    };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

router.get('/:address/detail/tokens', async (req, res) => {
  let { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    if (address.length < 40) {
      address = toHexAddress(address, network);
    }
    address = formatHexAddress(address);
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
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
        { $limit: limitPage + skip },
        { $skip: skip },
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
