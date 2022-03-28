import express = require('express');
import { fromHexAddress } from '../../modules/firocoin/utils';
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';

async function streamCoins(req, res) {
  let { address, chain, network } = req.params;
  address = await fromHexAddress({ address, chain, network });
  let { unspent, limit = 10, since } = req.query;
  let payload = {
    chain,
    network,
    address,
    req,
    res,
    args: { ...req.query, unspent, limit, since },
  };
  ChainStateProvider.streamAddressTransactions(payload);
}

router.get('/:address', async function (req, res) {
  let { address, chain, network } = req.params;
  address = await fromHexAddress({ address, chain, network });
  let { unspent, limit = 10, since } = req.query;
  let payload = {
    chain,
    network,
    address,
    req,
    res,
    args: { unspent, limit, since },
  };
  ChainStateProvider.streamAddressUtxos(payload);
});

router.get('/:address/txs', streamCoins);
router.get('/:address/coins', streamCoins);

router.get('/:address/balance', async function (req, res) {
  let { address, chain, network } = req.params;
  address = await fromHexAddress({ address, chain, network });
  try {
    let result = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address,
      args: req.query,
    });
    return res.send(result || { confirmed: 0, unconfirmed: 0, balance: 0 });
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/address',
};
