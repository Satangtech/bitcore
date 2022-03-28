import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { AsyncRPC } from '../../rpc';
import { Config } from '../../services/config';

const fromHexAddress = async ({ address, chain, network }) => {
  address = address.replace('0x', '');
  if (address.length === 40) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { username, password, host, port } = chainConfig.rpc;
    const rpc = new AsyncRPC(username, password, host, port);
    address = await rpc.call('fromhexaddress', [address]);
  }
  return address;
};

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
