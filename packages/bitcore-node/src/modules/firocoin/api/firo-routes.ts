import { Router } from 'express';
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
    const tokens = await TokenStorage.collection
      .find({ chain, network })
      .limit(20)
      .skip(+paging > 0 ? (+paging - 1) * 20 : 0)
      .toArray();
    for (let token of tokens) {
      token['holders'] = Object.keys(token.balances).length;
    }
    res.json(tokens);
  } catch (err) {
    res.status(500).send(err);
  }
});
