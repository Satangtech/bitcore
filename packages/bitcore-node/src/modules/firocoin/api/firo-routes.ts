import { Router } from 'express';
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { ContractStorage } from '../models/contract';
import { EvmDataStorage } from '../models/evmData';
import { TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import { fromHexAddress } from '../utils';
export const FiroRoutes = Router();

FiroRoutes.get('/api/:chain/:network/contract/:contractAddress', async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  try {
    contractAddress = contractAddress.replace('0x', '');
    const contract = await ContractStorage.getContract({ chain, network, contractAddress });
    if (contract !== null) {
      const tx = await ChainStateProvider.getTransaction({ chain, network, txId: contract.txid });
      contract['fee'] = tx.fee;
      contract['receipt'] = tx.receipt;
      res.json(contract);
    } else {
      res.status(404).send(`The requested contract address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/prices', async (_, res) => {
  try {
    res.json({
      NXC: 0.33 * 1e9, // price in usd * 1e9
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token', async (req, res) => {
  const { chain, network } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 20;
    const tokens = await TokenStorage.collection
      .find({ chain, network })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    for (let token of tokens) {
      token['holders'] = await TokenBalanceStorage.collection.countDocuments({
        contractAddress: token.contractAddress,
      });
    }
    res.json(tokens);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress', async (req, res) => {
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
      res.json(token);
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tx', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 3;
    const transactions = await TransactionStorage.collection
      .find({
        chain,
        network,
        'receipt.log.address': contractAddress,
      })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokentransfers', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 3;
    const transactions = await TransactionStorage.collection
      .find({
        chain,
        network,
        'receipt.log.address': contractAddress,
        'receipt.events.type': 'transfer',
      })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokenholder', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const tokenHolder = await TokenBalanceStorage.collection
      .find({
        chain,
        network,
        contractAddress,
      })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    for (let token of tokenHolder) {
      token.balance = token.balance.toString();
    }
    res.json(tokenHolder);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail', async (req, res) => {
  const { chain, network, address } = req.params;
  try {
    const addressFiro = await fromHexAddress({ address, chain, network });
    const balanceAddress = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address: addressFiro,
      args: req.query,
    });
    const balance = balanceAddress.balance;
    const transactionCount = await TransactionStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'coins',
            let: {
              txid: '$txid',
              addressFiro,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$mintTxid', '$$txid'],
                      },
                      {
                        $eq: ['$address', '$$addressFiro'],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'coins',
          },
        },
        { $match: { coins: { $exists: true, $ne: [] } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();
    const tokenBalances = await TokenBalanceStorage.collection
      .find({ chain, network, address })
      .sort({ _id: -1 })
      .toArray();
    const tokens: any[] = [];
    for (let tokenBalnce of tokenBalances) {
      const contractAddress = tokenBalnce.contractAddress;
      const token = await TokenStorage.collection.findOne({ contractAddress, chain, network });
      if (token) {
        tokens.push({
          contractAddress,
          balance: tokenBalnce.balance,
          symbol: token.symbol,
          name: token.name,
        });
      }
    }
    res.json({
      balance,
      tokens,
      transactionCount: transactionCount[0]['count'],
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tx', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const addressFiro = await fromHexAddress({ address, chain, network });
    const txs = await TransactionStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'coins',
            let: {
              txid: '$txid',
              addressFiro,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$mintTxid', '$$txid'],
                      },
                      {
                        $eq: ['$address', '$$addressFiro'],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'coins',
          },
        },
        { $match: { coins: { $exists: true, $ne: [] } } },
      ])
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    res.json(txs);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tokentransfers', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const txs = await TransactionStorage.collection
      .find({
        chain,
        network,
        'receipt.events.from': address,
        'receipt.events.type': 'transfer',
      })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    res.json(txs);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tokens', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
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
            balance: 1,
            txid: '$tokens.txid',
            name: '$tokens.name',
            symbol: '$tokens.symbol',
            type: 'erc20',
            decimal: '$tokens.decimals',
          },
        },
      ])
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+page > 0 ? (+page - 1) * limitPage : 0)
      .toArray();
    res.json(tokens);
  } catch (err) {
    res.status(500).send(err);
  }
});
