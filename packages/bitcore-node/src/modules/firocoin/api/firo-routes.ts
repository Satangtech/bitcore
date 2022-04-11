import { Router } from 'express';
import { CoinStorage } from '../../../models/coin';
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { Storage } from '../../../services/storage';
import { ContractStorage } from '../models/contract';
import { EvmDataStorage } from '../models/evmData';
import { IToken, TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import { fromHexAddress } from '../utils';
export const FiroRoutes = Router();

// NOTE: TBD
FiroRoutes.get('/api/:chain/:network/contract/:contractAddress', async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  try {
    contractAddress = contractAddress.replace('0x', '');
    const addressFiro = fromHexAddress(contractAddress, network);
    const balanceAddress = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address: addressFiro,
      args: req.query,
    });
    const balance = balanceAddress.balance;
    const contract = await ContractStorage.getContract({ chain, network, contractAddress });
    if (contract !== null) {
      const tx = await ChainStateProvider.getTransaction({ chain, network, txId: contract.txid });
      contract['fee'] = tx.fee;
      contract['receipt'] = tx.receipt;
      contract['balance'] = balance;
      contract['transactions'] = await TransactionStorage.collection.countDocuments({
        chain,
        network,
        $or: [{ 'receipt.events.from': contractAddress }, { 'receipt.events.to': contractAddress }],
        'receipt.events.type': 'transfer',
      });
      const tokenBalances = await TokenBalanceStorage.collection
        .find({ chain, network, address: contractAddress })
        .sort({ _id: -1 })
        .toArray();
      const tokens: any[] = [];
      for (let tokenBalnce of tokenBalances) {
        const contractAddress = tokenBalnce.contractAddress;
        const token = await TokenStorage.collection.findOne({ contractAddress, chain, network });
        if (token) {
          tokens.push({
            contractAddress,
            balance: tokenBalnce.balance.toString(),
            symbol: token.symbol,
            name: token.name,
          });
        }
      }
      contract['tokens'] = tokens;
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
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network, 'receipt.log.address': contractAddress };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokentransfers', async (req, res) => {
  const { chain, network, contractAddress } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 3;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = { chain, network, 'receipt.log.address': contractAddress, 'receipt.events.type': 'transfer' };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokenholder', async (req, res) => {
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

FiroRoutes.get('/api/:chain/:network/address/:address/detail', async (req, res) => {
  const { chain, network, address } = req.params;
  try {
    const addressFiro = fromHexAddress(address, network);
    const balanceAddress = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address: addressFiro,
      args: req.query,
    });
    const balance = balanceAddress.balance;

    const transactionNative = (
      await CoinStorage.collection
        .aggregate([
          { $match: { address: addressFiro } },
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
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tx', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const addressFiro = fromHexAddress(address, network);
    const transactionNative = (
      await CoinStorage.collection
        .aggregate([
          { $match: { address: addressFiro } },
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
    const query = { chain, network, txid: { $in: (<any>transactionNative).concat(transactionEVM) } };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tokentransfers', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
    const limitPage = limit ? +limit : 5;
    const skip = +page > 0 ? (+page - 1) * limitPage : 0;
    const sort = { _id: -1 };
    const query = {
      chain,
      network,
      $or: [{ 'receipt.events.from': address }, { 'receipt.events.to': address }],
      'receipt.events.type': 'transfer',
    };
    const args = { skip, sort, limit: limitPage };
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tokens', async (req, res) => {
  const { chain, network, address } = req.params;
  const { limit, page } = req.query;
  try {
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
    res.status(500).send(err);
  }
});
