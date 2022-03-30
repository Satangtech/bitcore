import { Router } from 'express';
import { CoinStorage } from '../../../models/coin';
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { ContractStorage } from '../models/contract';
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
  let { chain, network, paging, limit } = req.params;
  try {
    const limitPage = limit ? +limit : 20;
    const tokens = await TokenStorage.collection
      .find({ chain, network })
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+paging > 0 ? (+paging - 1) * limitPage : 0)
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
  let { chain, network, contractAddress } = req.params;
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
      res.json(token);
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tx', async (req, res) => {
  let { chain, network, contractAddress, paging, limit } = req.params;
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
      .skip(+paging > 0 ? (+paging - 1) * limitPage : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokentransfers', async (req, res) => {
  let { chain, network, contractAddress, paging, limit } = req.params;
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
      .skip(+paging > 0 ? (+paging - 1) * limitPage : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokenholder', async (req, res) => {
  let { chain, network, contractAddress, paging, limit } = req.params;
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
      .skip(+paging > 0 ? (+paging - 1) * limitPage : 0)
      .toArray();
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
    const transactionCount = await CoinStorage.collection.countDocuments({ address: addressFiro });
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
      transactionCount,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/address/:address/detail/tx', async (req, res) => {
  const { chain, network, address, paging, limit } = req.params;
  try {
    const limitPage = limit ? +limit : 5;
    const addressFiro = await fromHexAddress({ address, chain, network });
    const txs = await TransactionStorage.collection
      .aggregate([
        {
          $lookup: {
            from: 'coins',
            localField: 'txid',
            foreignField: 'mintTxid',
            as: 'coins',
          },
        },
        { $match: { 'coins.address': addressFiro } },
      ])
      .sort({ _id: -1 })
      .limit(limitPage)
      .skip(+paging > 0 ? (+paging - 1) * limitPage : 0)
      .toArray();
    res.json(txs);
  } catch (err) {
    res.status(500).send(err);
  }
});
