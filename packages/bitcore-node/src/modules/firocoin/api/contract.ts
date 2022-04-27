import { TransactionStorage } from '../../../models/transaction';
import { ContractStorage } from '../models/contract';
import { TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import express = require('express');
import { Storage } from '../../../services/storage';
const router = express.Router({ mergeParams: true });
const fs = require('fs');
var solc = require('solc');

router.get('/:contractAddress', async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  try {
    contractAddress = contractAddress.replace('0x', '');
    const contract = await ContractStorage.getContract({ chain, network, contractAddress });
    if (contract) {
      contract['balance'] = 0;
      contract['transactions'] = await TransactionStorage.collection.countDocuments({
        chain,
        network,
        'receipt.to': contractAddress,
      });
      contract['transfers'] = await TransactionStorage.collection.countDocuments({
        chain,
        network,
        'receipt.to': contractAddress,
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

router.get('/:contractAddress/event', async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  contractAddress = contractAddress.replace('0x', '');
  const { limit, page } = req.query;
  const limitPage = limit ? +limit : 5;
  const skip = +page > 0 ? (+page - 1) * limitPage : 0;
  const sort = { _id: -1 };
  const query = {
    chain,
    network,
    'receipt.to': contractAddress,
  };
  const args = { skip, sort, limit: limitPage };
  try {
    Storage.apiStreamingFind(TransactionStorage, query, args, req, res);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/:contractAddress', async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  const folder = '/bitcore/packages/bitcore-node/src/modules/firocoin/api/contract';
  if (!fs.existsSync(folder)) {
    await fs.promises.mkdir(folder);
  }
  await fs.promises.writeFile(`${folder}/${contractAddress}.sol`, req.body);
  const input = {
    language: 'Solidity',
    sources: {
      [contractAddress]: {
        content: req.body,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  var output = JSON.parse(solc.compile(JSON.stringify(input)));
  let byteCode = '';
  let contractName = '';
  for (contractName in output.contracts[contractAddress]) {
    byteCode = output.contracts[contractAddress][contractName].evm.bytecode.object;
  }
  res.send({
    chain,
    network,
    contractName,
    byteCode,
  });
});

module.exports = {
  router,
  path: '/contract',
};
