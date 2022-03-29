import { AsyncRPC } from '../../rpc';
import { Config } from '../../services/config';
import { AddressStorage } from './models/address';

export const fromHexAddress = async ({ address, chain, network }) => {
  address = address.replace('0x', '');
  if (address.length === 40) {
    const addressCollection = await AddressStorage.collection.findOne({ address, chain, network });
    if (addressCollection) {
      return addressCollection.addressFiro;
    } else {
      const chainConfig = Config.chainConfig({ chain, network });
      const { username, password, host, port } = chainConfig.rpc;
      const rpc = new AsyncRPC(username, password, host, port);
      const addressFiro = await rpc.call('fromhexaddress', [address]);
      AddressStorage.collection.updateOne(
        { address },
        {
          $set: {
            chain,
            network,
            address,
            addressFiro,
          },
        },
        { upsert: true }
      );
      return addressFiro;
    }
  }
  return address;
};
