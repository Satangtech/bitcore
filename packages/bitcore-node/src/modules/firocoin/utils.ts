import { AsyncRPC } from '../../rpc';
import { Config } from '../../services/config';

export const fromHexAddress = async ({ address, chain, network }) => {
  address = address.replace('0x', '');
  if (address.length === 40) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { username, password, host, port } = chainConfig.rpc;
    const rpc = new AsyncRPC(username, password, host, port);
    address = await rpc.call('fromhexaddress', [address]);
  }
  return address;
};
