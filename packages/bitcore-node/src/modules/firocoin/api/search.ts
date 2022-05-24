import express = require('express');
import { TransactionStorage } from '../../../models/transaction';
import { ChainStateProvider } from '../../../providers/chain-state';
import { ContractStorage } from '../models/contract';
import { TokenStorage } from '../models/token';
import { fromHexAddress, toHexAddress } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/:content', async (req, res) => {
  let { chain, network, content } = req.params;
  try {
    content = Buffer.from(content, 'base64').toString('utf-8');

    // TODO: Other Address
    // const regexBitcoinAddresses = /([13]|bc1)[A-HJ-NP-Za-km-z1-9]{27,34}/g;

    const regexNativeAddress = /T[A-HJ-NP-Za-km-z1-9]{33}/g;
    const matchNativeAddress = content.match(regexNativeAddress);
    if (matchNativeAddress && content.length === 34) {
      const nativeAddress = matchNativeAddress[0];
      const hexAddress = toHexAddress(nativeAddress, network);
      return res.json({
        type: 'account',
        hex: hexAddress,
        native: nativeAddress,
      });
    }

    const regexHexAddress = /[0-9a-fA-F]{40}/g;
    const matchHexAddress = content.match(regexHexAddress);
    if (matchHexAddress && content.length === 40) {
      const hexAddress = matchHexAddress[0];
      const contract = await ContractStorage.collection.findOne({
        chain,
        network,
        contractAddress: hexAddress.toLowerCase(),
      });
      if (contract) {
        return res.json({
          type: 'contract',
          address: contract.contractAddress,
        });
      } else {
        const nativeAddress = fromHexAddress(hexAddress, network);
        return res.json({
          type: 'account',
          hex: hexAddress,
          native: nativeAddress,
        });
      }
    }

    const regexBlockNumber = /[0-9]{1,15}/g;
    const matchBlockNumber = content.match(regexBlockNumber);
    if (matchBlockNumber && content.length <= 15) {
      const blockId = matchBlockNumber[0];
      let block = await ChainStateProvider.getBlock({ chain, network, blockId });
      if (!block) {
        return res.status(404).send('block not found');
      }
      return res.json({
        type: 'block',
        blockId: block.hash,
      });
    }

    const regexHash = /[0-9a-zA-Z]{64}/g;
    const matchHash = content.match(regexHash);
    if (matchHash && content.length === 64) {
      const hash = matchHash[0];
      const transaction = await TransactionStorage.collection.findOne({ chain, network, txid: hash });
      if (transaction) {
        return res.json({
          type: 'txid',
        });
      } else {
        return res.json({
          type: 'block',
          blockId: hash,
        });
      }
    }

    const tokens = await TokenStorage.collection
      .find({
        chain,
        network,
        $or: [{ symbol: new RegExp(content, 'i') }, { name: new RegExp(content, 'i') }],
      })
      .toArray();
    if (tokens.length > 0) {
      const result: any = [];
      for (let token of tokens) {
        result.push({
          address: token.contractAddress,
          name: token.name,
          symbol: token.symbol,
        });
      }
      return res.json({
        type: 'token',
        result,
      });
    } else {
      return res.status(404).send(`Search ${content} could not be found.`);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/search',
};
