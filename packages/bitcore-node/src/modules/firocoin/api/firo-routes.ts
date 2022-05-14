import { Router } from 'express';
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { ContractStorage } from '../models/contract';
import { TokenStorage } from '../models/token';
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
      NXC: 0.33 * 1e9 // price in usd * 1e9
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token', async (req, res) => {
  let { chain, network, paging } = req.params;
  try {
    const limit = 20;
    const tokens = await TokenStorage.collection
      .find({ chain, network })
      .limit(limit)
      .skip(+paging > 0 ? (+paging - 1) * limit : 0)
      .toArray();
    for (let token of tokens) {
      token['holders'] = Object.keys(token.balances).length;
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
        'receipt.log.address': contractAddress
      });
      token['holders'] = Object.keys(token.balances).length;
      res.json(token);
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tx', async (req, res) => {
  let { chain, network, contractAddress, paging } = req.params;
  try {
    const limit = 3;
    const transactions = await TransactionStorage.collection
      .find({
        chain,
        network,
        'receipt.log.address': contractAddress
      })
      .limit(limit)
      .skip(+paging > 0 ? (+paging - 1) * limit : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokentransfers', async (req, res) => {
  let { chain, network, contractAddress, paging } = req.params;
  try {
    const limit = 3;
    const transactions = await TransactionStorage.collection
      .find({
        chain,
        network,
        'receipt.log.address': contractAddress,
        'receipt.events.type': 'transfer'
      })
      .limit(limit)
      .skip(+paging > 0 ? (+paging - 1) * limit : 0)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

FiroRoutes.get('/api/:chain/:network/token/:contractAddress/tokenholder', async (req, res) => {
  let { chain, network, contractAddress, paging } = req.params;
  try {
    const limit = 5;
    const token = await TokenStorage.collection.findOne({ chain, network, contractAddress });
    if (token) {
      const result = {};
      const page = +paging > 1 ? +paging : 1;
      let addresses = Object.keys(token.balances).slice((page - 1) * limit, page * limit);
      for (let address of addresses) {
        result[address] = token.balances[address];
      }
      res.json(result);
    } else {
      res.status(404).send(`The requested token address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
