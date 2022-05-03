import { TransactionStorage } from '../../../models/transaction';
import { ContractStorage } from '../models/contract';
import { TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import express = require('express');
import { Storage } from '../../../services/storage';
import { EvmDataStorage } from '../models/evmData';
const fs = require('fs');
const multer = require('multer');
const Web3EthAbi = require('web3-eth-abi');
const solc = require('solc');

const router = express.Router({ mergeParams: true });
const folderUpload = '/bitcore/packages/bitcore-node/src/modules/firocoin/api/contracts';
const upload = multer({ dest: folderUpload });

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

router.get('/:contractAddress/code', async (req, res) => {
  let { contractAddress } = req.params;
  try {
    const fileExists = await fs.promises
      .access(`${folderUpload}/${contractAddress}.sol`, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (fileExists) {
      res.download(`${folderUpload}/${contractAddress}.sol`);
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

router.post('/:contractAddress', upload.single('file'), async (req, res) => {
  let { chain, network, contractAddress } = req.params;
  const input = {
    language: 'Solidity',
    sources: {
      [contractAddress]: {
        content: await fs.promises.readFile(req['file'].path, 'utf8'),
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
  let byteCode = '';
  let contractName = '';
  let abi = [];

  // req.body['version'] => 'v0.8.13+commit.abaa5c0e'
  solc.loadRemoteVersion(req.body['version'], async (_, solc_specific) => {
    const output = JSON.parse(solc_specific.compile(JSON.stringify(input)));
    for (let contract in output.contracts[contractAddress]) {
      if (
        output.contracts[contractAddress][contract].abi.length !== 0 &&
        output.contracts[contractAddress][contract].evm.bytecode.object !== '' &&
        output.contracts[contractAddress][contract].abi.length > abi.length
      ) {
        abi = output.contracts[contractAddress][contract].abi;
        byteCode = output.contracts[contractAddress][contract].evm.bytecode.object.replace('0x', '');
        contractName = contract;
      }
    }

    const contract = await ContractStorage.collection.findOne({ chain, network, contractAddress });
    let callData = '';
    if (contract) {
      const evmData = await EvmDataStorage.collection.findOne({ chain, network, txid: contract.txid });
      if (evmData) {
        callData = evmData.callData;
      }
    }

    let inputs = abi.filter((method) => method['type'] === 'constructor');
    if (inputs.length > 0) {
      inputs = (<any>inputs[0]['inputs']).map((input) => input.type);
      if (inputs.length > 0) {
        const encodeInputs = Web3EthAbi.encodeParameters(inputs, req.body['inputs']).replace('0x', '');
        callData = callData.replace(encodeInputs, '');
      }
    }

    byteCode = byteCode.slice(0, -86); // contract's metadata
    callData = callData.slice(0, -86); // 32 bytes (64 hexadecimal characters) + 11 bytes (22 hexadecimal characters)
    if (byteCode === callData) {
      await fs.promises.rename(req['file'].path, `${folderUpload}/${contractAddress}.sol`);
      ContractStorage.collection.updateOne(
        { contractAddress, chain, network },
        {
          $set: {
            name: contractName,
            abi: abi,
          },
        },
        { upsert: true }
      );
      res.send({
        chain,
        network,
        contractName,
      });
    } else {
      res.status(400).send('Verify Fail!');
    }
  });
});

module.exports = {
  router,
  path: '/contract',
};
