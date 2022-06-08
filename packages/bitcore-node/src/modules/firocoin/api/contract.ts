import { TransactionStorage } from '../../../models/transaction';
import { ContractStorage } from '../models/contract';
import { TokenStorage } from '../models/token';
import { TokenBalanceStorage } from '../models/tokenBalance';
import express = require('express');
import { Storage } from '../../../services/storage';
import { EvmDataStorage } from '../models/evmData';
import fetch from 'node-fetch';

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
  let { chain, network, contractAddress } = req.params;
  try {
    const contract = await ContractStorage.collection.findOne({ chain, network, contractAddress });
    if (contract) {
      const response = await fetch(`http://storage:5555/contracts/${contractAddress}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from('admin:Admin123!').toString('base64'),
        },
      });
      const data = await response.json();
      const compileSetting = {
        language: 'Solidity',
        sources: {
          [contractAddress]: {
            content: Buffer.from(data.code, 'base64').toString('utf8'),
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
      if (contract.name === '') {
        ContractStorage.collection.updateOne(
          { contractAddress, chain, network },
          {
            $set: {
              name: data.name,
            },
          },
          { upsert: true }
        );
      }
      solc.loadRemoteVersion(data.version, async (_, solc_specific) => {
        try {
          const output = JSON.parse(solc_specific.compile(JSON.stringify(compileSetting)));
          console.log('output', output);
          for (let contractName in output.contracts[contractAddress]) {
            if (
              output.contracts[contractAddress][contractName].abi.length !== 0 &&
              output.contracts[contractAddress][contractName].evm.bytecode.object !== ''
            ) {
              const abi = output.contracts[contractAddress][contractName].abi;
              if (contractName === data.name) {
                data.abi = abi;
                res.send(data);
                return;
              }
            }
          }
        } catch (err) {
          console.error(err);
          res.status(500).send(err);
        }
      });
    } else {
      res.status(404).send(`The requested contract address ${contractAddress} could not be found.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.get('/:contractAddress/abi', async (req, res) => {
  let { contractAddress } = req.params;
  try {
    const fileExists = await fs.promises
      .access(`${folderUpload}/${contractAddress}.json`, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (fileExists) {
      res.download(`${folderUpload}/${contractAddress}.json`);
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
  try {
    const compileSetting = {
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
    const inputConstructor = req.body['inputs'];
    const solcVersion = req.body['version'];

    const contract = await ContractStorage.collection.findOne({ chain, network, contractAddress });
    let evmCallData = '';
    if (contract) {
      const evmData = await EvmDataStorage.collection.findOne({ chain, network, txid: contract.txid });
      if (evmData) {
        evmCallData = evmData.callData;
      } else {
        res.status(404).send(`The requested contract address ${contractAddress} could not be found.`);
        return;
      }
    } else {
      res.status(404).send(`The requested contract address ${contractAddress} could not be found.`);
      return;
    }

    // solcVersion => 'v0.8.13+commit.abaa5c0e',
    solc.loadRemoteVersion(solcVersion, async (_, solc_specific) => {
      try {
        const output = JSON.parse(solc_specific.compile(JSON.stringify(compileSetting)));
        for (let contract in output.contracts[contractAddress]) {
          if (
            output.contracts[contractAddress][contract].abi.length !== 0 &&
            output.contracts[contractAddress][contract].evm.bytecode.object !== ''
          ) {
            const contractName = contract;
            const abi = output.contracts[contractAddress][contract].abi;
            let byteCode = output.contracts[contractAddress][contract].evm.bytecode.object.replace('0x', '');
            let callData = evmCallData;

            let inputs = abi.filter((method) => method['type'] === 'constructor');
            if (inputs.length > 0) {
              inputs = (<any>inputs[0]['inputs']).map((input) => input.type);
              if (inputConstructor && inputs.length > 0) {
                const encodeInputs = Web3EthAbi.encodeParameters(inputs, inputConstructor).replace('0x', '');
                callData = evmCallData.replace(encodeInputs, '');
              }
            }

            byteCode = byteCode.slice(0, -86); // contract's metadata
            callData = callData.slice(0, -86); // 32 bytes (64 hexadecimal characters) + 11 bytes (22 hexadecimal characters)
            if (byteCode === callData) {
              await fs.promises.rename(req['file'].path, `${folderUpload}/${contractAddress}.sol`);
              const fileByte = await fs.promises.readFile(`${folderUpload}/${contractAddress}.sol`);
              const fileBase64 = Buffer.from(fileByte).toString('base64');
              const jsonObj = {
                name: contractName,
                version: solcVersion,
                optimized: false,
                code: fileBase64,
              };

              try {
                await fetch(`http://storage:5555/contracts/${contractAddress}`, {
                  method: 'post',
                  body: JSON.stringify(jsonObj),
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from('admin:Admin123!').toString('base64'),
                  },
                });
              } catch (err) {
                console.error(err);
                res.status(500).send(err);
                return;
              }

              ContractStorage.collection.updateOne(
                { contractAddress, chain, network },
                {
                  $set: {
                    name: contractName,
                  },
                },
                { upsert: true }
              );
              res.send({
                chain,
                network,
                contractName,
              });
              return;
            }
          }
        }
        res.status(400).send('Verify Fail!');
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/contract',
};
